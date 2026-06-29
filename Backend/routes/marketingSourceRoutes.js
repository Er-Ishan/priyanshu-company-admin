import express from "express";
import db from "../config/db.js";

const router = express.Router();

let schemaReady = false;
let hasBookingMarketingColumn = false;

export async function ensureMarketingSchema() {
  if (schemaReady) return hasBookingMarketingColumn;

  try {
    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS marketing_sources (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(50) NOT NULL,
        description VARCHAR(255) DEFAULT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_company_slug (company_id, slug),
        KEY idx_company_active (company_id, is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    const [bookingCols] = await db.promise().query(
      "SHOW COLUMNS FROM parking_bookings LIKE 'marketing_source'"
    );
    if (bookingCols.length === 0) {
      await db.promise().query(`
        ALTER TABLE parking_bookings
        ADD COLUMN marketing_source VARCHAR(50) DEFAULT NULL
        AFTER source
      `);
    }

    const [msCols] = await db.promise().query(
      "SHOW COLUMNS FROM marketing_sources LIKE 'media_source_id'"
    );
    if (msCols.length === 0) {
      await db.promise().query(`
        ALTER TABLE marketing_sources
        ADD COLUMN media_source_id INT DEFAULT NULL
        AFTER company_id
      `);
    }

    const [trackingCols] = await db.promise().query(
      "SHOW COLUMNS FROM marketing_sources LIKE 'tracking_code'"
    );
    if (trackingCols.length === 0) {
      await db.promise().query(`
        ALTER TABLE marketing_sources
        ADD COLUMN tracking_code VARCHAR(50) NULL
        AFTER slug
      `);
    }

    const [slugUnique] = await db.promise().query(
      "SHOW INDEX FROM marketing_sources WHERE Key_name = 'uq_company_slug'"
    );
    if (slugUnique.length > 0) {
      await db.promise().query(
        "ALTER TABLE marketing_sources DROP INDEX uq_company_slug"
      );
    }

    hasBookingMarketingColumn = true;
  } catch (err) {
    console.error("ensureMarketingSchema error:", err.message || err);
    const [bookingCols] = await db.promise().query(
      "SHOW COLUMNS FROM parking_bookings LIKE 'marketing_source'"
    ).catch(() => [[]]);
    hasBookingMarketingColumn = bookingCols.length > 0;
  } finally {
    schemaReady = true;
  }

  return hasBookingMarketingColumn;
}

ensureMarketingSchema();

function companyIdFromReq(req) {
  const raw =
    req.user?.company_id ??
    req.companyId ??
    req.headers["x-company-id"];
  const id = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function requireCompanyId(req, res) {
  const companyId = companyIdFromReq(req);
  if (!companyId) {
    res.status(400).json({
      success: false,
      message: "Company ID is required. Please log in again.",
    });
    return null;
  }
  return companyId;
}

export function normalizeSlug(slug) {
  return String(slug || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildMarketingLink(baseUrl, acronym, trackingCode = null) {
  if (!baseUrl || !acronym) return null;
  const code = String(acronym).trim();
  if (!code) return null;
  const url = /^https?:\/\//i.test(baseUrl) ? baseUrl : `https://${baseUrl}`;
  const separator = url.includes("?") ? "&" : "?";
  let link = `${url}${separator}src=${encodeURIComponent(code)}`;
  const cid = String(trackingCode || "").trim();
  if (cid) {
    link += `&cid=${encodeURIComponent(cid)}`;
  }
  return link;
}

export async function getCompanyDomain(companyId) {
  const [companyRows] = await db.promise().query(
    "SELECT domain, name FROM companies WHERE id = ? LIMIT 1",
    [companyId]
  );
  return companyRows[0] || null;
}

export async function getCompanyBookingBaseUrl(companyId) {
  const company = await getCompanyDomain(companyId);
  const domain = company?.domain?.trim();
  return domain || null;
}

export async function resolveMarketingSource(companyId, rawSource) {
  const [rows] = await db.promise().query(
    "SELECT slug FROM marketing_sources WHERE company_id = ? AND LOWER(slug) = LOWER(?) AND is_active = 1 LIMIT 1",
    [companyId, String(rawSource).trim()]
  );
  return rows.length ? rows[0].slug : null;
}

async function attachBookingLinks(sources, companyId) {
  const baseUrl = await getCompanyBookingBaseUrl(companyId);
  return sources.map((row) => {
    const acronym = row.acronym || row.slug;
    return {
      ...row,
      acronym,
      media_name: row.media_name || row.name,
      booking_link: buildMarketingLink(baseUrl, acronym, row.tracking_code),
      base_url: baseUrl,
    };
  });
}

export async function loadMediaSource(mediaSourceId) {
  const [rows] = await db.promise().query(
    "SELECT id, media_name, acronym FROM media_sources WHERE id = ? AND is_active = 1 LIMIT 1",
    [mediaSourceId]
  );
  return rows[0] || null;
}

async function assertNoDuplicateMarketingSource(companyId, mediaSourceId, trackingCode, excludeId = null) {
  const normalizedTracking = trackingCode ? String(trackingCode).trim().slice(0, 50) : "";
  const params = [companyId, mediaSourceId, normalizedTracking];
  let sql = `
    SELECT id FROM marketing_sources
    WHERE company_id = ? AND media_source_id = ?
      AND COALESCE(tracking_code, '') = ?
  `;
  if (excludeId) {
    sql += " AND id != ?";
    params.push(excludeId);
  }
  sql += " LIMIT 1";

  const [rows] = await db.promise().query(sql, params);
  if (rows.length) {
    const err = new Error("DUPLICATE_MARKETING_SOURCE");
    err.code = "DUPLICATE_MARKETING_SOURCE";
    throw err;
  }
}

router.get("/media-sources", async (_req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT id, media_name, acronym, is_active
       FROM media_sources
       WHERE is_active = 1
       ORDER BY media_name ASC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("GET /media-sources error:", err);
    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message || "Server error",
    });
  }
});

router.get("/marketing-sources", async (req, res) => {
  try {
    const companyId = requireCompanyId(req, res);
    if (!companyId) return;

    await ensureMarketingSchema();

    let rows;
    try {
      [rows] = await db.promise().query(
        `SELECT ms.*,
          med.media_name,
          med.acronym,
          COALESCE((
            SELECT COUNT(*)
            FROM parking_bookings pb
            WHERE pb.company_id = ms.company_id
              AND pb.marketing_source = ms.slug
          ), 0) AS booking_count
         FROM marketing_sources ms
         LEFT JOIN media_sources med ON med.id = ms.media_source_id
         WHERE ms.company_id = ?
         ORDER BY COALESCE(med.media_name, ms.name) ASC`,
        [companyId]
      );
    } catch (countErr) {
      console.warn("booking_count subquery failed, using fallback:", countErr.message);
      [rows] = await db.promise().query(
        `SELECT ms.*, 0 AS booking_count
         FROM marketing_sources ms
         LEFT JOIN media_sources med ON med.id = ms.media_source_id
         WHERE ms.company_id = ?
         ORDER BY COALESCE(med.media_name, ms.name) ASC`,
        [companyId]
      );
    }

    const company = await getCompanyDomain(companyId);
    const baseUrl = await getCompanyBookingBaseUrl(companyId);
    const data = await attachBookingLinks(rows, companyId);
    return res.json({
      success: true,
      data,
      base_url: baseUrl,
      domain: company?.domain || null,
      company_name: company?.name || null,
    });
  } catch (err) {
    console.error("GET /marketing-sources error:", err);
    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message || "Server error",
    });
  }
});

router.get("/marketing-sources/booking-base-url", async (req, res) => {
  try {
    const companyId = requireCompanyId(req, res);
    if (!companyId) return;

    const company = await getCompanyDomain(companyId);
    const baseUrl = await getCompanyBookingBaseUrl(companyId);
    return res.json({
      success: true,
      base_url: baseUrl,
      domain: company?.domain || null,
      company_name: company?.name || null,
    });
  } catch (err) {
    console.error("GET /marketing-sources/booking-base-url error:", err);
    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message || "Server error",
    });
  }
});

function parseCsvParam(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

async function resolveMarketingSlugs(companyId, { sources, mediaSourceId, linkIds }) {
  const slugSet = new Set();

  const directSlugs = sources.map(normalizeSlug).filter(Boolean);
  directSlugs.forEach((s) => slugSet.add(s));

  if (mediaSourceId || linkIds.length) {
    const where = ["company_id = ?"];
    const params = [companyId];

    if (mediaSourceId) {
      where.push("media_source_id = ?");
      params.push(Number(mediaSourceId));
    }
    if (linkIds.length) {
      const ids = linkIds.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0);
      if (ids.length) {
        where.push(`id IN (${ids.map(() => "?").join(",")})`);
        params.push(...ids);
      }
    }

    const [rows] = await db.promise().query(
      `SELECT slug FROM marketing_sources WHERE ${where.join(" AND ")}`,
      params
    );
    rows.forEach((row) => {
      const slug = normalizeSlug(row.slug);
      if (slug) slugSet.add(slug);
    });
  }

  return [...slugSet];
}

router.get("/marketing-sources/bookings", async (req, res) => {
  try {
    const companyId = requireCompanyId(req, res);
    if (!companyId) return;

    const bookingColumnReady = await ensureMarketingSchema();
    if (!bookingColumnReady) {
      return res.json({ success: true, data: [], total: 0 });
    }

    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(500, Math.max(1, Number(req.query.limit || 50)));
    const offset = (page - 1) * limit;

    const from = req.query.from || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const to = req.query.to || new Date().toISOString().slice(0, 10);
    const search = String(req.query.search || "").trim();

    const slugs = await resolveMarketingSlugs(companyId, {
      sources: parseCsvParam(req.query.sources),
      mediaSourceId: req.query.media_source_id ? Number(req.query.media_source_id) : null,
      linkIds: parseCsvParam(req.query.link_ids),
    });

    const where = [
      "pb.company_id = ?",
      "pb.marketing_source IS NOT NULL",
      "pb.marketing_source != ''",
      "DATE(pb.created_at) BETWEEN ? AND ?",
      "pb.status NOT IN ('Cancelled', 'Pending')",
    ];
    const params = [companyId, from, to];

    if (slugs.length) {
      where.push(`pb.marketing_source IN (${slugs.map(() => "?").join(",")})`);
      params.push(...slugs);
    }

    if (search) {
      const s = `%${search}%`;
      where.push(
        "(" +
          [
            "pb.ref_no LIKE ?",
            "pb.first_name LIKE ?",
            "pb.last_name LIKE ?",
            "pb.email LIKE ?",
            "pb.mobile LIKE ?",
            "pb.vehicle_registration LIKE ?",
            "pb.product_name LIKE ?",
          ].join(" OR ") +
          ")"
      );
      params.push(s, s, s, s, s, s, s);
    }

    const whereSql = `WHERE ${where.join(" AND ")}`;

    const countSql = `
      SELECT COUNT(*) AS total
      FROM parking_bookings pb
      ${whereSql}
    `;
    const dataSql = `
      SELECT pb.*,
        COALESCE(ms.name, pb.marketing_source) AS marketing_source_name,
        med.media_name,
        med.acronym
      FROM parking_bookings pb
      LEFT JOIN marketing_sources ms
        ON ms.company_id = pb.company_id AND ms.slug = pb.marketing_source
      LEFT JOIN media_sources med ON med.id = ms.media_source_id
      ${whereSql}
      ORDER BY pb.id DESC
      LIMIT ? OFFSET ?
    `;

    const [countRows] = await db.promise().query(countSql, params);
    const total = Number(countRows?.[0]?.total || 0);
    const [rows] = await db.promise().query(dataSql, [...params, limit, offset]);

    return res.json({
      success: true,
      data: rows,
      total,
      from,
      to,
    });
  } catch (err) {
    console.error("GET /marketing-sources/bookings error:", err);
    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message || "Server error",
    });
  }
});

router.get("/marketing-sources/analytics", async (req, res) => {
  try {
    const companyId = requireCompanyId(req, res);
    if (!companyId) return;
    const from = req.query.from || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const to = req.query.to || new Date().toISOString().slice(0, 10);
    const sourceFilter = req.query.sources
      ? String(req.query.sources).split(",").map(normalizeSlug).filter(Boolean)
      : null;
    const mediaSourceId = req.query.media_source_id ? Number(req.query.media_source_id) : null;
    const linkIds = parseCsvParam(req.query.link_ids);

    let effectiveSourceFilter = sourceFilter;
    if (!effectiveSourceFilter?.length && (mediaSourceId || linkIds.length)) {
      effectiveSourceFilter = await resolveMarketingSlugs(companyId, {
        sources: [],
        mediaSourceId,
        linkIds,
      });
    }

    const bookingColumnReady = await ensureMarketingSchema();
    if (!bookingColumnReady) {
      return res.json({
        success: true,
        from,
        to,
        summary: [],
        trend: [],
      });
    }

    let summarySql = `
      SELECT
        pb.marketing_source AS slug,
        COALESCE(ms.name, pb.marketing_source) AS name,
        COUNT(*) AS bookings,
        SUM(CASE WHEN pb.status = 'Active' THEN 1 ELSE 0 END) AS active_bookings,
        COALESCE(SUM(pb.total_payable), 0) AS revenue
      FROM parking_bookings pb
      LEFT JOIN marketing_sources ms
        ON ms.company_id = pb.company_id AND ms.slug = pb.marketing_source
      WHERE pb.company_id = ?
        AND pb.marketing_source IS NOT NULL
        AND pb.marketing_source != ''
        AND DATE(pb.created_at) BETWEEN ? AND ?
    `;
    const summaryParams = [companyId, from, to];

    if (effectiveSourceFilter?.length) {
      summarySql += ` AND pb.marketing_source IN (${effectiveSourceFilter.map(() => "?").join(",")})`;
      summaryParams.push(...effectiveSourceFilter);
    } else if (sourceFilter?.length) {
      summarySql += ` AND pb.marketing_source IN (${sourceFilter.map(() => "?").join(",")})`;
      summaryParams.push(...sourceFilter);
    }

    summarySql += " GROUP BY pb.marketing_source, ms.name ORDER BY bookings DESC";

    let trendSql = `
      SELECT
        DATE(pb.created_at) AS date,
        pb.marketing_source AS slug,
        COUNT(*) AS bookings,
        COALESCE(SUM(pb.total_payable), 0) AS revenue
      FROM parking_bookings pb
      WHERE pb.company_id = ?
        AND pb.marketing_source IS NOT NULL
        AND pb.marketing_source != ''
        AND DATE(pb.created_at) BETWEEN ? AND ?
    `;
    const trendParams = [companyId, from, to];

    if (effectiveSourceFilter?.length) {
      trendSql += ` AND pb.marketing_source IN (${effectiveSourceFilter.map(() => "?").join(",")})`;
      trendParams.push(...effectiveSourceFilter);
    }

    trendSql += " GROUP BY DATE(pb.created_at), pb.marketing_source ORDER BY date ASC";

    const [summaryResult, trendResult] = await Promise.all([
      db.promise().query(summarySql, summaryParams),
      db.promise().query(trendSql, trendParams),
    ]);

    return res.json({
      success: true,
      from,
      to,
      summary: summaryResult[0] || [],
      trend: trendResult[0] || [],
    });
  } catch (err) {
    console.error("GET /marketing-sources/analytics error:", err);
    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message || "Server error",
    });
  }
});

router.get("/marketing-sources/validate", async (req, res) => {
  try {
    const companyId = companyIdFromReq(req);
    const slug = normalizeSlug(req.query.src || req.query.slug);
    if (!slug) {
      return res.status(400).json({ success: false, message: "src is required" });
    }

    const [rows] = await db.promise().query(
      "SELECT id, name, slug FROM marketing_sources WHERE company_id = ? AND slug = ? AND is_active = 1 LIMIT 1",
      [companyId, slug]
    );

    if (!rows.length) {
      return res.json({ success: true, valid: false });
    }

    return res.json({ success: true, valid: true, source: rows[0] });
  } catch (err) {
    console.error("GET /marketing-sources/validate error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/marketing-sources", async (req, res) => {
  try {
    const companyId = requireCompanyId(req, res);
    if (!companyId) return;

    await ensureMarketingSchema();
    const { media_source_id, description, is_active, tracking_code } = req.body;

    if (!media_source_id) {
      return res.status(400).json({ success: false, message: "Media source is required" });
    }

    const media = await loadMediaSource(media_source_id);
    if (!media) {
      return res.status(400).json({ success: false, message: "Invalid media source selected" });
    }

    const acronym = String(media.acronym).trim();
    const mediaName = String(media.media_name).trim();
    const trackingCode = tracking_code ? String(tracking_code).trim().slice(0, 50) || null : null;

    await assertNoDuplicateMarketingSource(companyId, media.id, trackingCode);

    const [result] = await db.promise().query(
      `INSERT INTO marketing_sources (company_id, media_source_id, name, slug, tracking_code, description, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        companyId,
        media.id,
        mediaName,
        acronym,
        trackingCode,
        description || null,
        is_active === 0 ? 0 : 1,
      ]
    );

    return res.status(201).json({ success: true, id: result.insertId, message: "Marketing source created" });
  } catch (err) {
    console.error("POST /marketing-sources error:", err);
    if (err.code === "DUPLICATE_MARKETING_SOURCE") {
      return res.status(409).json({
        success: false,
        message: "A link with this media source and campaign ID already exists",
      });
    }
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ success: false, message: "This source code already exists for your company" });
    }
    return res.status(500).json({ success: false, message: err.sqlMessage || err.message || "Server error" });
  }
});

router.put("/marketing-sources/:id", async (req, res) => {
  try {
    const companyId = requireCompanyId(req, res);
    if (!companyId) return;
    const { media_source_id, description, is_active, tracking_code } = req.body;

    if (!media_source_id) {
      return res.status(400).json({ success: false, message: "Media source is required" });
    }

    const media = await loadMediaSource(media_source_id);
    if (!media) {
      return res.status(400).json({ success: false, message: "Invalid media source selected" });
    }

    const acronym = String(media.acronym).trim();
    const mediaName = String(media.media_name).trim();
    const trackingCode = tracking_code ? String(tracking_code).trim().slice(0, 50) || null : null;

    await assertNoDuplicateMarketingSource(companyId, media.id, trackingCode, Number(req.params.id));

    const [result] = await db.promise().query(
      `UPDATE marketing_sources
       SET media_source_id = ?, name = ?, slug = ?, tracking_code = ?, description = ?, is_active = ?
       WHERE id = ? AND company_id = ?`,
      [
        media.id,
        mediaName,
        acronym,
        trackingCode,
        description || null,
        is_active === 0 ? 0 : 1,
        req.params.id,
        companyId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Marketing source not found" });
    }

    return res.json({ success: true, message: "Marketing source updated" });
  } catch (err) {
    console.error("PUT /marketing-sources/:id error:", err);
    if (err.code === "DUPLICATE_MARKETING_SOURCE") {
      return res.status(409).json({
        success: false,
        message: "A link with this media source and campaign ID already exists",
      });
    }
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ success: false, message: "This source code already exists" });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/marketing-sources/:id", async (req, res) => {
  try {
    const companyId = requireCompanyId(req, res);
    if (!companyId) return;
    const [result] = await db.promise().query(
      "DELETE FROM marketing_sources WHERE id = ? AND company_id = ?",
      [req.params.id, companyId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Marketing source not found" });
    }

    return res.json({ success: true, message: "Marketing source deleted" });
  } catch (err) {
    console.error("DELETE /marketing-sources/:id error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
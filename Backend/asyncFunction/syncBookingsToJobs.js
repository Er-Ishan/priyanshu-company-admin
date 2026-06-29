import express from "express";
import db from "../config/db.js";
import { decryptParam } from "../utils/decryptParam.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Sync Parking Booking -> Job
|--------------------------------------------------------------------------
| URL:
| GET /api/jobs/sync-bookings?company_id=<encrypted>&booking_id=<encrypted>
|
| What it does:
| 1. Decrypts company_id and booking_id
| 2. Loads booking from parking_bookings for that company
| 3. If a job already exists for booking_id + company_id:
|    - Compares booking dates with job dates
|    - Updates jobs when dates changed
| 4. Otherwise inserts a new jobs record
|--------------------------------------------------------------------------
*/

function buildJobDataFromBooking(booking) {
  const customerName =
    `${booking.first_name || ""} ${booking.last_name || ""}`.trim();

  const dropOffDate = new Date(booking.drop_off_date);
  const returnDate = new Date(booking.return_date);

  const parkingDays =
    Math.floor((returnDate - dropOffDate) / (1000 * 60 * 60 * 24)) + 1;

  return {
    company_id: booking.company_id,
    booking_id: booking.id,
    booking_ref: booking.ref_no || "TBC",
    airport: booking.travelling_from || "TBC",
    customer_name: customerName,
    bookingnote: booking.notes || "TBC",
    booking_date: booking.created_at || new Date(),
    depdatetime: booking.drop_off_date || new Date(),
    terminal_name: booking.depart_terminal || "TBC",
    depflight: booking.depart_flight || "TBC",
    returndatetime: booking.return_date || new Date(),
    retern_terminal_name: booking.return_terminal || "TBC",
    returnflight: booking.return_flight || "TBC",
    vehiclemake: booking.vehicle_make || "TBC",
    vehiclemodel: booking.vehicle_model || "TBC",
    vehiclecolour: booking.vehicle_colour || "TBC",
    vehicleregnumber: booking.vehicle_registration || "TBC",
    passengers: booking.passengers || booking.vehicle_no || 1,
    parkingdays: parkingDays,
    product_id: 1,
  };
}

function toTimestamp(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

function bookingDatesChanged(booking, job) {
  const bookingDropOff = toTimestamp(booking.drop_off_date);
  const bookingReturn = toTimestamp(booking.return_date);
  const bookingCreated = toTimestamp(booking.created_at);

  const jobDropOff = toTimestamp(job.depdatetime);
  const jobReturn = toTimestamp(job.returndatetime);
  const jobBookingDate = toTimestamp(job.booking_date);

  if (bookingDropOff !== jobDropOff) return true;
  if (bookingReturn !== jobReturn) return true;
  if (bookingCreated !== jobBookingDate) return true;

  const dropOffDate = new Date(booking.drop_off_date);
  const returnDate = new Date(booking.return_date);
  const expectedParkingDays =
    Math.floor((returnDate - dropOffDate) / (1000 * 60 * 60 * 24)) + 1;

  return Number(job.parkingdays) !== Number(expectedParkingDays);
}

async function syncBookingToJob(encryptedCompanyId, encryptedBookingId) {
  const companyId = Number(decryptParam(encryptedCompanyId));
  const bookingId = Number(decryptParam(encryptedBookingId));

  if (!companyId || !bookingId) {
    throw new Error("Invalid company_id or booking_id after decryption");
  }

  const [bookings] = await db.promise().query(
    `
      SELECT *
      FROM parking_bookings
      WHERE id = ? AND company_id = ?
      LIMIT 1
    `,
    [bookingId, companyId]
  );

  if (!bookings.length) {
    return {
      success: false,
      status: "NOT_FOUND",
      message: "Booking not found for the given company",
      company_id: companyId,
      booking_id: bookingId,
    };
  }

  const booking = bookings[0];
  const jobData = buildJobDataFromBooking(booking);

  const [existingJobs] = await db.promise().query(
    `
      SELECT *
      FROM jobs
      WHERE booking_id = ? AND company_id = ?
      LIMIT 1
    `,
    [bookingId, companyId]
  );

  if (existingJobs.length > 0) {
    const existingJob = existingJobs[0];

    if (!bookingDatesChanged(booking, existingJob)) {
      return {
        success: true,
        status: "UNCHANGED",
        message: "Job already exists and booking dates are unchanged",
        company_id: companyId,
        booking_id: bookingId,
        job_id: existingJob.id,
      };
    }

    const updateData = { ...jobData };
    delete updateData.company_id;
    delete updateData.booking_id;

    await db.promise().query(
      `
        UPDATE jobs
        SET ?
        WHERE id = ? AND company_id = ?
      `,
      [updateData, existingJob.id, companyId]
    );

    return {
      success: true,
      status: "UPDATED",
      message: "Job updated because booking dates changed",
      company_id: companyId,
      booking_id: bookingId,
      job_id: existingJob.id,
    };
  }

  await db.promise().query(
    `
      INSERT INTO jobs SET ?
    `,
    [jobData]
  );

  const [insertedJobs] = await db.promise().query(
    `
      SELECT id
      FROM jobs
      WHERE booking_id = ? AND company_id = ?
      ORDER BY id DESC
      LIMIT 1
    `,
    [bookingId, companyId]
  );

  return {
    success: true,
    status: "INSERTED",
    message: "New job created from booking",
    company_id: companyId,
    booking_id: bookingId,
    job_id: insertedJobs[0]?.id || null,
  };
}

router.get("/sync-bookings", async (req, res) => {
  try {
    const encryptedCompanyId =
      req.query.company_id || req.body?.company_id;
    const encryptedBookingId =
      req.query.booking_id || req.body?.booking_id;

    if (!encryptedCompanyId || !encryptedBookingId) {
      return res.status(400).json({
        success: false,
        message: "company_id and booking_id are required",
      });
    }

    const result = await syncBookingToJob(
      encryptedCompanyId,
      encryptedBookingId
    );

    const statusCode =
      result.status === "NOT_FOUND" ? 404 : 200;

    return res.status(statusCode).json(result);
  } catch (error) {
    console.error("SYNC ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/sync-bookings", async (req, res) => {
  try {
    const encryptedCompanyId =
      req.body?.company_id || req.query.company_id;
    const encryptedBookingId =
      req.body?.booking_id || req.query.booking_id;

    if (!encryptedCompanyId || !encryptedBookingId) {
      return res.status(400).json({
        success: false,
        message: "company_id and booking_id are required",
      });
    }

    const result = await syncBookingToJob(
      encryptedCompanyId,
      encryptedBookingId
    );

    const statusCode =
      result.status === "NOT_FOUND" ? 404 : 200;

    return res.status(statusCode).json(result);
  } catch (error) {
    console.error("SYNC ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;

import { Router, type IRouter } from "express";
import bookingsRouter from "./bookings";
import healthRouter from "./health";
import trackingRouter from "./tracking";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(bookingsRouter);
router.use(healthRouter);
router.use(trackingRouter);
router.use("/admin", adminRouter);

export default router;

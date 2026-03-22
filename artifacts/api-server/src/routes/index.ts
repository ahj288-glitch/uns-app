import { Router, type IRouter } from "express";
import healthRouter from "./health";
import waitlistRouter from "./waitlist";
import companionRouter from "./companion";
import moodsRouter from "./moods";
import insightsRouter from "./insights";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(waitlistRouter);
router.use(companionRouter);
router.use(moodsRouter);
router.use(insightsRouter);
router.use(adminRouter);

export default router;

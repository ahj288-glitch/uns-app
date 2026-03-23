import { Router, type IRouter } from "express";
import healthRouter from "./health";
import waitlistRouter from "./waitlist";
import companionRouter from "./companion";
import moodsRouter from "./moods";
import insightsRouter from "./insights";
import adminRouter from "./admin";
import gamificationRouter from "./gamification";
import communityRouter from "./community";

const router: IRouter = Router();

router.use(healthRouter);
router.use(waitlistRouter);
router.use(companionRouter);
router.use(moodsRouter);
router.use(insightsRouter);
router.use(adminRouter);
router.use("/gamification", gamificationRouter);
router.use(communityRouter);

export default router;

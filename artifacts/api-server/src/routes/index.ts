import { Router, type IRouter } from "express";
import { verifyToken, requireAdmin } from "../middlewares/auth.js";
import authRouter from "./auth";
import healthRouter from "./health";
import waitlistRouter from "./waitlist";
import companionRouter from "./companion";
import moodsRouter from "./moods";
import insightsRouter from "./insights";
import adminRouter from "./admin";
import gamificationRouter from "./gamification";
import communityRouter from "./community";
import dailyRecipesRouter from "./daily-recipes";

const router: IRouter = Router();

router.use(authRouter);
router.use(healthRouter);
router.use(waitlistRouter);

router.use(verifyToken);

router.use(companionRouter);
router.use(moodsRouter);
router.use(insightsRouter);
router.use("/gamification", gamificationRouter);
router.use(communityRouter);
router.use(dailyRecipesRouter);

router.use("/admin", requireAdmin);
router.use(adminRouter);

export default router;

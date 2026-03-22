import { db } from "./index";
import { programsTable } from "./schema";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Seeding wellness programs...");
  
  await db.execute(sql`
    INSERT INTO wellness_programs (title_ar, title_en, description_ar, description_en, duration_days, category, tier, active, enrolled_count, completion_rate)
    VALUES
      ('رحلة التوازن', 'Balance Journey', 'برنامج 21 يوماً لتحقيق التوازن العاطفي', '21-day program for emotional balance', 21, 'general', 'free', true, 843, 0.72),
      ('خطوات الطمأنينة', 'Serenity Steps', 'تقنيات للتعامل مع القلق اليومي', 'Techniques for managing daily anxiety', 14, 'anxiety', 'free', true, 621, 0.68),
      ('نوم هادئ', 'Restful Sleep', 'تحسين جودة النوم والراحة الليلية', 'Improve sleep quality and nighttime rest', 7, 'sleep', 'premium', true, 312, 0.81),
      ('رمضان معك', 'Ramadan With You', 'رفيق روحي خلال الشهر الكريم', 'Spiritual companion during the holy month', 30, 'ramadan', 'free', true, 1204, 0.89),
      ('شفاء الحزن', 'Healing Grief', 'دعم نفسي للتعامل مع الخسارة والحزن', 'Emotional support for loss and grief', 28, 'grief', 'premium', true, 187, 0.64),
      ('روحانيات اليوم', 'Daily Spirituality', 'تأملات وأذكار يومية للطمأنينة', 'Daily reflections and dhikr for tranquility', 10, 'spiritual', 'free', true, 932, 0.77)
    ON CONFLICT DO NOTHING
  `);
  
  console.log("Seeded successfully!");
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });

import type {
  ActivityFrequency,
  ActivityMeasurement,
} from "@/lib/db/collections";

const categories = [
  "ইবাদত",
  "স্বাস্থ্য",
  "পড়াশোনা",
  "কাজ",
  "ব্যক্তিগত",
  "অন্যান্য",
];
const weekdays = [
  { value: 6, label: "শনি" },
  { value: 0, label: "রবি" },
  { value: 1, label: "সোম" },
  { value: 2, label: "মঙ্গল" },
  { value: 3, label: "বুধ" },
  { value: 4, label: "বৃহস্পতি" },
  { value: 5, label: "শুক্র" },
];

export function ActivityDefinitionFields({
  activity,
}: {
  activity?: {
    name: string;
    description?: string;
    category: string;
    measurement: ActivityMeasurement;
    target: number;
    unit?: string;
    frequency: ActivityFrequency;
    days: number[];
  };
}) {
  return (
    <div className="activity-form-grid">
      <label className="activity-field activity-field-wide">
        <span>Activity-এর নাম</span>
        <input
          name="name"
          defaultValue={activity?.name}
          required
          minLength={2}
          maxLength={80}
        />
      </label>
      <fieldset className="activity-frequency activity-field-wide">
        <legend>কখন দেখাবেন</legend>
        <label>
          <input
            type="radio"
            name="frequency"
            value="daily"
            defaultChecked={!activity || activity.frequency === "daily"}
          />
          প্রতিদিন
        </label>
        <label>
          <input
            type="radio"
            name="frequency"
            value="selected_days"
            defaultChecked={activity?.frequency === "selected_days"}
          />
          নির্বাচিত দিনে
        </label>
        <div className="activity-weekdays">
          {weekdays.map((day) => (
            <label key={day.value}>
              <input
                type="checkbox"
                name="days"
                value={day.value}
                defaultChecked={activity?.days.includes(day.value)}
              />
              <span>{day.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="activity-field">
        <span>Category</span>
        <select
          name="category"
          defaultValue={activity?.category ?? "ব্যক্তিগত"}
        >
          {categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
      </label>
      <label className="activity-field">
        <span>যেভাবে মাপবেন</span>
        <select
          name="measurement"
          defaultValue={activity?.measurement ?? "boolean"}
          disabled={Boolean(activity)}
        >
          <option value="boolean">Done / Not Done</option>
          <option value="counter">কতবার</option>
          <option value="duration">সময়</option>
          <option value="quantity">পরিমাণ</option>
        </select>
        {activity && (
          <input
            type="hidden"
            name="measurement"
            value={activity.measurement}
          />
        )}
      </label>
      <label className="activity-field">
        <span>দৈনিক target</span>
        <input
          name="target"
          type="number"
          min="0.01"
          max="1000000"
          step="0.01"
          defaultValue={activity?.target ?? 1}
          required
        />
      </label>
      <label className="activity-field">
        <span>Unit (প্রয়োজনে)</span>
        <input
          name="unit"
          defaultValue={activity?.unit}
          maxLength={24}
          placeholder="মিনিট, পৃষ্ঠা, গ্লাস…"
        />
      </label>
      <label className="activity-field activity-field-wide">
        <span>ছোট বিবরণ (ঐচ্ছিক)</span>
        <textarea
          name="description"
          defaultValue={activity?.description}
          maxLength={300}
          rows={2}
        />
      </label>
    </div>
  );
}

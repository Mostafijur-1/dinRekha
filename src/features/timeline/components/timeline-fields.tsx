import type { TimelineEntryView } from "@/features/timeline/repository";

export function TimelineFields({
  entry,
  defaults,
  allowInProgress = true,
}: {
  entry?: TimelineEntryView;
  defaults?: { activity: string; category: string; startTime?: string };
  allowInProgress?: boolean;
}) {
  return (
    <div className="timeline-form-grid">
      <label className="activity-field">
        <span>Activity</span>
        <input
          name="activity"
          defaultValue={entry?.activity ?? defaults?.activity}
          maxLength={80}
          required
          placeholder="যেমন: পড়াশোনা"
        />
      </label>
      <label className="activity-field">
        <span>Category</span>
        <input
          name="category"
          defaultValue={entry?.category ?? defaults?.category}
          maxLength={40}
          required
          placeholder="যেমন: কাজ"
        />
      </label>
      <label className="activity-field">
        <span>শুরুর সময়</span>
        <input
          name="startTime"
          type="time"
          defaultValue={entry?.startTime ?? defaults?.startTime}
          required
        />
      </label>
      <label className="activity-field">
        <span>শেষের সময়</span>
        <input
          name="endTime"
          type="time"
          defaultValue={entry?.endTime}
          required={!allowInProgress}
        />
        <small>
          {allowInProgress
            ? "খালি রাখলে Activity এখন চলছে বলে ধরা হবে।"
            : "আগের দিনের entry-তে শেষের সময় আবশ্যক।"}
        </small>
      </label>
      <label className="activity-field activity-field-wide">
        <span>ব্যক্তিগত note (ঐচ্ছিক)</span>
        <textarea
          name="note"
          defaultValue={entry?.note}
          maxLength={500}
          rows={2}
        />
      </label>
    </div>
  );
}

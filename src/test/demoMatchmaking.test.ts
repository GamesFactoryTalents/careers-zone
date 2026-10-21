import { describe, expect, it } from "vitest";
import { DEMO_COMPANY, DEMO_JOBS, DEMO_PROFILES, DEMO_TALENT_ID } from "@/data/demoMatchmaking";

describe("conference matchmaking demo fixtures", () => {
  it("provides several platform roles published by the sample company", () => {
    expect(DEMO_JOBS.length).toBeGreaterThanOrEqual(3);
    expect(DEMO_JOBS.every((job) => job.source === "recruiter" && job.company === DEMO_COMPANY.name)).toBe(true);
  });

  it("provides several populated talent profiles for recruiter discovery", () => {
    const talents = DEMO_PROFILES.filter((profile) => profile.account_type === "talent");
    expect(talents.length).toBeGreaterThanOrEqual(3);
    expect(talents.find((profile) => profile.user_id === DEMO_TALENT_ID)?.profile.skills).toContain("Unity");
  });
});

import { test, expect } from "@playwright/test";

type LoginArgs = {
  email: string;
  password: string;
  targetPath: string;
};

async function loginAs(page: any, { email, password, targetPath }: LoginArgs) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });

  await page.locator("input#email").fill(email);
  await page.locator("input#password").fill(password);

  const loginButton = page.getByRole("button", { name: "Login" });
  await expect(loginButton).toBeEnabled({ timeout: 30_000 });

  const escaped = targetPath.replaceAll("/", "\\/");
  await Promise.all([
    page.waitForURL(new RegExp(escaped), {
      timeout: 180_000,
      waitUntil: "domcontentloaded",
    }),
    loginButton.click(),
  ]);

  // Basic sanity: after login, we should not still be on the login page.
  expect(page.url()).not.toMatch(/\/login/);
}

test.describe("End-to-end UI navigation stays authenticated", () => {
  test.describe.configure({ timeout: 600_000 });

  test("HR can navigate core admin tabs without logout", async ({ page }) => {
    const email = process.env.E2E_HR_EMAIL ?? "testhr@jobhire.com";
    const password = process.env.E2E_HR_PASSWORD ?? "TestHR123!";

    await loginAs(page, {
      email,
      password,
      targetPath: "/admin/dashboard",
    });

    await expect(page.getByText(/Welcome,/i)).toBeVisible();

    const sidebarSteps: Array<{ navTitle: string; heading: RegExp }> = [
      { navTitle: "Company", heading: /Company Management/i },
      { navTitle: "Jobs", heading: /Jobs Management/i },
      { navTitle: "Applications", heading: /Applications/i },
    ];

    for (const step of sidebarSteps) {
      await page.getByRole("link", { name: step.navTitle }).click();
      await expect(page).not.toHaveURL(/\/login/);
      // Some sections load via client-side rendering; wait for the expected heading or visible tab content.
        await expect(page.getByRole("heading", { name: step.heading }).first()).toBeVisible({
          timeout: 60_000,
        });
      // Give the session a chance to validate/refresh across route transitions
      await page.waitForTimeout(2000);
    }

    // Idle check: ensure they are still authenticated after a short pause.
    await page.waitForTimeout(20_000);
    await page.getByRole("link", { name: "Jobs" }).click();
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: /Jobs Management/i }).first()).toBeVisible();
  });

  test("Candidate can navigate dashboards and application screens without logout", async ({
    page,
  }) => {
    const email =
      process.env.E2E_CANDIDATE_EMAIL ?? "candidate.e2e.000000@test.com";
    const password = process.env.E2E_CANDIDATE_PASSWORD ?? "CandidateE2E123!";

    // Candidate may land on /user/dashboard if profile is complete; otherwise /onboarding.
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.locator("input#email").fill(email);
    await page.locator("input#password").fill(password);

    const loginButton = page.getByRole("button", { name: "Login" });
    await expect(loginButton).toBeEnabled({ timeout: 30_000 });

    const redirectPromise = Promise.race([
      page.waitForURL(/\/user\/dashboard/, { timeout: 540_000, waitUntil: "domcontentloaded" }),
      page.waitForURL(/\/onboarding/, { timeout: 540_000, waitUntil: "domcontentloaded" }),
    ]);

    const invalidPromise = page
      .getByText(/Invalid email or password/i)
      .waitFor({ timeout: 15_000 })
      .then(() => "error")
      .catch(() => "no-error");

    await loginButton.click();

    const outcome = await Promise.race([
      redirectPromise.then(() => "redirect"),
      invalidPromise,
    ]);

    if (outcome === "error") {
      throw new Error(`Login failed for ${email}: Invalid email or password`);
    }

    if (outcome !== "redirect") {
      await redirectPromise;
    }

    // Verify session has not bounced us to /login
    await expect(page).not.toHaveURL(/\/login/);

    if (page.url().includes("/user/dashboard")) {
      await expect(page.getByText(/Monitor your job applications/i)).toBeVisible();
      await page.goto("/user/jobs", { waitUntil: "domcontentloaded" });
      await expect(page).not.toHaveURL(/\/login/);
      await expect(page.getByRole("heading", { name: /Find Jobs/i }).first()).toBeVisible();

      await page.goto("/user/applications", { waitUntil: "domcontentloaded" });
      await expect(page).not.toHaveURL(/\/login/);
      await expect(page.getByText(/My Applications/i)).toBeVisible();
    } else {
      await page.goto("/onboarding/profile-completion", { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { name: /Complete Your Profile/i })).toBeVisible();

      await page.goto("/onboarding/resume-upload", { waitUntil: "domcontentloaded" });
      await expect(page).not.toHaveURL(/\/login/);
    }

    // Idle check
    await page.waitForTimeout(20_000);
    await page.goto(page.url().includes("/user/") ? "/user/dashboard" : "/onboarding", {
      waitUntil: "domcontentloaded",
    });
    await expect(page).not.toHaveURL(/\/login/);
  });

  test("Manager can navigate dashboard/performance/recruitments without logout", async ({
    page,
  }) => {
    const email = process.env.E2E_MANAGER_EMAIL ?? "testmanager@jobhire.com";
    const password = process.env.E2E_MANAGER_PASSWORD ?? "TestManager123!";

    await loginAs(page, {
      email,
      password,
      targetPath: "/manager/dashboard",
    });

    await expect(page.getByText(/Total Applications/i)).toBeVisible();

    const steps: Array<{ url: string; text: RegExp }> = [
      { url: "/manager/performance", text: /Recruiters Performance Overview/i },
      { url: "/manager/recruitments", text: /Recruitment Analytics Details/i },
      { url: "/manager/dashboard", text: /Total Applications/i },
    ];

    for (const step of steps) {
      await page.goto(step.url, { waitUntil: "domcontentloaded" });
      await expect(page).not.toHaveURL(/\/login/);
      await expect(page.getByText(step.text)).toBeVisible();
      await page.waitForTimeout(2000);
    }

    await page.waitForTimeout(20_000);
    await page.goto("/manager/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByText(/Total Applications/i)).toBeVisible();
  });
});


import {
  act,
  fireEvent,
  renderRouter,
  screen,
  testRouter,
  waitFor,
} from "expo-router/testing-library";

import { notificationDouble } from "../doubles/notifications";
import { dueDateForWeek, seed } from "../helpers";

describe("reminders", () => {
  beforeEach(() => notificationDouble.reset());

  it("schedules one repeating reminder when switched on, and clears it when off", async () => {
    await seed();
    renderRouter("app", { initialUrl: "/reminders/pelvic-floor" });

    await waitFor(() =>
      expect(
        screen.getByTestId("reminders-screen-pelvic-floor"),
      ).toBeOnTheScreen(),
    );
    expect(screen.getByText("Off")).toBeOnTheScreen();
    expect(notificationDouble.scheduled).toHaveLength(0);

    fireEvent(screen.getByLabelText("Daily reminder"), "valueChange", true);

    await waitFor(() => expect(notificationDouble.scheduled).toHaveLength(1));
    // The contract that matters: one daily trigger at the saved time, filed under
    // this program's own identifier so the other two can be replaced without it.
    expect(
      notificationDouble.forProgram("pelvic-floor")?.trigger,
    ).toMatchObject({
      type: "daily",
      hour: 9,
      minute: 0,
    });
    await waitFor(() =>
      expect(screen.getByText(/Every day at/)).toBeOnTheScreen(),
    );

    fireEvent(screen.getByLabelText("Daily reminder"), "valueChange", false);

    await waitFor(() => expect(notificationDouble.scheduled).toHaveLength(0));
    expect(screen.getByText("Off")).toBeOnTheScreen();
  });

  it("takes its wording from the program and the current stage", async () => {
    // Week 38 is the birth-prep stage, where telling her to build strength
    // would be the wrong advice.
    await seed({ profile: { dueDate: dueDateForWeek(38) } });
    renderRouter("app", { initialUrl: "/reminders/pelvic-floor" });

    await waitFor(() =>
      expect(
        screen.getByTestId("reminders-screen-pelvic-floor"),
      ).toBeOnTheScreen(),
    );
    fireEvent(screen.getByLabelText("Daily reminder"), "valueChange", true);

    await waitFor(() => expect(notificationDouble.scheduled).toHaveLength(1));
    expect(
      notificationDouble.forProgram("pelvic-floor")?.content,
    ).toMatchObject({
      title: "Practice opening",
    });
  });

  it("gives each program its own wording at the same stage", async () => {
    await seed({ profile: { dueDate: dueDateForWeek(38) } });
    renderRouter("app", { initialUrl: "/reminders/core" });

    await waitFor(() =>
      expect(screen.getByTestId("reminders-screen-core")).toBeOnTheScreen(),
    );
    expect(screen.getByText("Core strength")).toBeOnTheScreen();
    fireEvent(screen.getByLabelText("Daily reminder"), "valueChange", true);

    await waitFor(() => expect(notificationDouble.scheduled).toHaveLength(1));
    // Same stage as the test above, deliberately different advice.
    expect(notificationDouble.forProgram("core")?.content).toMatchObject({
      title: "Light and practical",
    });
  });

  /**
   * The whole reason reminders carry identifiers now. Switching one program on
   * must not disturb another's — the old implementation canceled everything the
   * app had ever scheduled and put back exactly one.
   */
  it("keeps three independent reminders at three different times", async () => {
    await seed({
      profile: {
        reminders: {
          "pelvic-floor": { enabled: true, hour: 9, minute: 0 },
          core: { enabled: true, hour: 17, minute: 30 },
          "birth-prep": { enabled: false, hour: 20, minute: 0 },
        },
      },
    });
    renderRouter("app", { initialUrl: "/reminders/birth-prep" });

    await waitFor(() => expect(notificationDouble.scheduled).toHaveLength(2));
    expect(
      notificationDouble.forProgram("pelvic-floor")?.trigger,
    ).toMatchObject({ hour: 9 });
    expect(notificationDouble.forProgram("core")?.trigger).toMatchObject({
      hour: 17,
      minute: 30,
    });
    expect(notificationDouble.forProgram("birth-prep")).toBeUndefined();

    // Turning the third on leaves the other two exactly as they were.
    fireEvent(screen.getByLabelText("Daily reminder"), "valueChange", true);

    await waitFor(() => expect(notificationDouble.scheduled).toHaveLength(3));
    expect(
      notificationDouble.forProgram("pelvic-floor")?.trigger,
    ).toMatchObject({ hour: 9 });
    expect(notificationDouble.forProgram("core")?.trigger).toMatchObject({
      hour: 17,
    });
    expect(notificationDouble.forProgram("birth-prep")?.trigger).toMatchObject({
      hour: 20,
    });
  });

  /**
   * An install upgrading from the single-program build has a reminder scheduled
   * with an identifier the OS made up, which nothing here can name. Left alone it
   * would fire alongside the new pelvic floor one, every day, forever.
   */
  it("sweeps a reminder left behind by an older build", async () => {
    notificationDouble.scheduled = [
      {
        identifier: "scheduled-0",
        content: { title: "Time to build" },
        trigger: { type: "daily", hour: 7, minute: 30 },
      },
    ];
    await seed({
      profile: {
        reminders: {
          "pelvic-floor": { enabled: true, hour: 7, minute: 30 },
          core: { enabled: false, hour: 17, minute: 0 },
          "birth-prep": { enabled: false, hour: 20, minute: 0 },
        },
      },
    });
    renderRouter("app", { initialUrl: "/reminders/pelvic-floor" });

    // One reminder, not two: the stray is gone and ours took its place.
    await waitFor(() =>
      expect(notificationDouble.forProgram("pelvic-floor")).toBeDefined(),
    );
    await waitFor(() => expect(notificationDouble.scheduled).toHaveLength(1));
  });

  it("does not claim to be on when permission is refused", async () => {
    notificationDouble.permission = "denied";
    await seed();
    renderRouter("app", { initialUrl: "/reminders/pelvic-floor" });

    await waitFor(() =>
      expect(
        screen.getByTestId("reminders-screen-pelvic-floor"),
      ).toBeOnTheScreen(),
    );
    fireEvent(screen.getByLabelText("Daily reminder"), "valueChange", true);

    // The switch stays off rather than reading as on while the OS drops everything.
    await waitFor(() => expect(screen.getByText("Off")).toBeOnTheScreen());
    expect(notificationDouble.scheduled).toHaveLength(0);
  });

  /**
   * A reminder is an invitation to practice, so tapping it should land on the
   * session rather than wherever the app happened to be. It opens on the first
   * exercise's intro, the same as starting from Today — the clock never starts
   * on its own.
   */
  it("takes a tap on a reminder to that program's session", async () => {
    await seed({
      profile: {
        reminders: {
          "pelvic-floor": { enabled: true, hour: 9, minute: 0 },
          core: { enabled: true, hour: 17, minute: 30 },
          "birth-prep": { enabled: false, hour: 20, minute: 0 },
        },
      },
    });
    const router = renderRouter("app", { initialUrl: "/" });

    await waitFor(() =>
      expect(screen.getByTestId("today-screen")).toBeOnTheScreen(),
    );
    await waitFor(() => expect(notificationDouble.scheduled).toHaveLength(2));

    act(() => notificationDouble.tap("core"));

    await waitFor(() => expect(router.getPathname()).toBe("/session/core"));
    expect(screen.getByText(/Step 1 of \d+/)).toBeOnTheScreen();
    expect(screen.getByText("I'm ready")).toBeOnTheScreen();
  });

  /**
   * The reminder carries its program, so the tap has to pick the tapped one out
   * of three rather than opening whichever session is first.
   */
  it("opens the program that was tapped, not another one", async () => {
    await seed({
      profile: {
        reminders: {
          "pelvic-floor": { enabled: true, hour: 9, minute: 0 },
          core: { enabled: true, hour: 17, minute: 30 },
          "birth-prep": { enabled: true, hour: 20, minute: 0 },
        },
      },
    });
    const router = renderRouter("app", { initialUrl: "/" });

    await waitFor(() => expect(notificationDouble.scheduled).toHaveLength(3));
    expect(notificationDouble.forProgram("birth-prep")?.content).toMatchObject({
      data: { programId: "birth-prep" },
    });

    act(() => notificationDouble.tap("birth-prep"));

    await waitFor(() =>
      expect(router.getPathname()).toBe("/session/birth-prep"),
    );
  });

  /**
   * Launched by the tap, rather than tapped while running: native holds the
   * response and no listener was alive to hear it, so the synchronous read is
   * the only report of it. It also fires the listener, the way a cold start
   * does — one tap must still open one session.
   */
  it("opens the session when the tap is what launched the app", async () => {
    await seed({
      profile: {
        reminders: {
          "pelvic-floor": { enabled: true, hour: 9, minute: 0 },
          core: { enabled: false, hour: 17, minute: 0 },
          "birth-prep": { enabled: false, hour: 20, minute: 0 },
        },
      },
    });
    const launch = notificationDouble.launchedBy("pelvic-floor");
    const router = renderRouter("app", { initialUrl: "/" });

    await waitFor(() =>
      expect(router.getPathname()).toBe("/session/pelvic-floor"),
    );

    // The same delivery arriving a second time, which is what the OS does on a
    // cold start once a listener exists. Two pushes would stack two sessions.
    act(() =>
      notificationDouble.listeners.forEach((listener) => listener(launch)),
    );

    expect(screen.getAllByText(/Step 1 of \d+/)).toHaveLength(1);
    expect(router.getPathname()).toBe("/session/pelvic-floor");
    // Today is underneath rather than replaced, so leaving the session lands on
    // it — that is what the stack's anchor buys on a cold open.
    expect(testRouter.canGoBack()).toBe(true);
  });

  /** Nothing to open: the app was opened the ordinary way. */
  it("stays on Today when the app is opened without a tap", async () => {
    await seed();
    const router = renderRouter("app", { initialUrl: "/" });

    await waitFor(() =>
      expect(screen.getByTestId("today-screen")).toBeOnTheScreen(),
    );
    // Today's own path, which the entry gate redirects to.
    expect(router.getPathname()).toBe("/");
  });
});

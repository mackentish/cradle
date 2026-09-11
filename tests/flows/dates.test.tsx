import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';

import { daysAgo, dueDateForWeek, seed } from '../helpers';

/** Types a YYYY-MM-DD into the three number fields, the way she would. */
function typeDate(key: string): void {
  const [year, month, day] = key.split('-');
  fireEvent.changeText(screen.getByLabelText('MM'), month);
  fireEvent.changeText(screen.getByLabelText('DD'), day);
  fireEvent.changeText(screen.getByLabelText('YYYY'), year);
}

describe('changing the dates from You', () => {
  it('moves the whole app when the due date changes', async () => {
    await seed();
    renderRouter('app', { initialUrl: '/(tabs)/you' });

    // The onboarding route stops existing once she is through it, so this row
    // has to reach an edit screen of its own.
    await waitFor(() => expect(screen.getByText('Week 20')).toBeOnTheScreen());
    fireEvent.press(screen.getByText('Due date'));

    await waitFor(() => expect(screen.getByTestId('due-date-screen')).toBeOnTheScreen());
    typeDate(dueDateForWeek(30));

    // Same preview as onboarding, worded for someone who is already here.
    await waitFor(() => expect(screen.getByText(/^Now in /)).toBeOnTheScreen());
    expect(screen.getByText('Week 30')).toBeOnTheScreen();

    fireEvent.press(screen.getByText('Save'));

    await waitFor(() => expect(screen.getByText('Restore from a backup')).toBeOnTheScreen());
    expect(screen.getByText('Week 30')).toBeOnTheScreen();
  });

  it('re-dates recovery when the birth date changes, and can take it back', async () => {
    await seed({ profile: { birthDate: daysAgo(21) } });
    renderRouter('app', { initialUrl: '/(tabs)/you' });

    await waitFor(() => expect(screen.getByText('3 weeks postpartum')).toBeOnTheScreen());
    fireEvent.press(screen.getByText('Birth date'));

    // Editing an existing birth date, not announcing a new arrival.
    await waitFor(() => expect(screen.getByTestId('birth-date-screen')).toBeOnTheScreen());
    expect(screen.queryByText('Congratulations')).not.toBeOnTheScreen();
    typeDate(daysAgo(7));

    fireEvent.press(screen.getByText('Save'));
    await waitFor(() => expect(screen.getByText('1 week postpartum')).toBeOnTheScreen());

    // A due date edited from here leaves the birth date — and so the postpartum
    // program — alone, which is where onboarding's "starting over" differs.
    fireEvent.press(screen.getByText('Due date'));
    await waitFor(() => expect(screen.getByTestId('due-date-screen')).toBeOnTheScreen());
    typeDate(dueDateForWeek(41));
    fireEvent.press(screen.getByText('Save'));

    await waitFor(() => expect(screen.getByText('Postpartum program')).toBeOnTheScreen());
    expect(screen.getByText('1 week postpartum')).toBeOnTheScreen();

    // And a birth date entered by mistake can be taken back.
    fireEvent.press(screen.getByText('Birth date'));
    await waitFor(() => expect(screen.getByTestId('birth-date-screen')).toBeOnTheScreen());
    fireEvent.press(screen.getByText("Baby hasn't arrived yet"));

    await waitFor(() => expect(screen.getByText('Baby has arrived')).toBeOnTheScreen());
    expect(screen.queryByText('Postpartum program')).not.toBeOnTheScreen();
  });
});

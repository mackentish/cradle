import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import { DateFields } from '@/components/DateFields';

describe('DateFields', () => {
  it('reports a parsed date once all three parts are filled', () => {
    const onChange = jest.fn();
    const view = render(<DateFields onChange={onChange} />);

    fireEvent.changeText(view.getByLabelText('MM'), '03');
    fireEvent.changeText(view.getByLabelText('DD'), '14');
    fireEvent.changeText(view.getByLabelText('YYYY'), '2027');

    const [date, touched] = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(date).toEqual(new Date(2027, 2, 14));
    expect(touched).toBe(true);
  });

  it('reports null for a date that does not exist', () => {
    const onChange = jest.fn();
    const view = render(<DateFields onChange={onChange} />);

    fireEvent.changeText(view.getByLabelText('MM'), '02');
    fireEvent.changeText(view.getByLabelText('DD'), '31');
    fireEvent.changeText(view.getByLabelText('YYYY'), '2027');

    const [date, touched] = onChange.mock.calls[onChange.mock.calls.length - 1];
    // 02/31 would silently roll over to March if it were built with new Date().
    expect(date).toBeNull();
    expect(touched).toBe(true);
  });

  it('strips non-digits and clamps each part', () => {
    const onChange = jest.fn();
    const view = render(<DateFields onChange={onChange} />);

    fireEvent.changeText(view.getByLabelText('MM'), 'a1b2c3');
    expect(view.getByLabelText('MM').props.value).toBe('12');
  });
});

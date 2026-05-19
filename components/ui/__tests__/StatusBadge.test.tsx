import { render, screen } from '@testing-library/react-native';

import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('renders status label', () => {
    render(<StatusBadge status="In Transit" />);
    expect(screen.getByText('In transit')).toBeTruthy();
  });

  it('shows HOT badge when hot', () => {
    render(<StatusBadge status="Dispatched" hot />);
    expect(screen.getByText('HOT')).toBeTruthy();
  });
});

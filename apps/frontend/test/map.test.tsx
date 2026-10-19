import { render, screen } from '@testing-library/react';
import { LocationMap } from '@/app/locations/locations-map';
const mockRemove = jest.fn();
const mockMap = jest.fn().mockImplementation(() => ({ on: jest.fn(), remove: mockRemove }));
jest.mock('@maptiler/sdk', () => ({ Map: function(...args: unknown[]) { return mockMap(...args); }, config: {}, MapStyle: { STREETS: 'streets' } }), { virtual: true });
jest.mock('@maptiler/sdk/dist/maptiler-sdk.css', () => ({}), { virtual: true });
it('does not instantiate the vulnerable attribution HTML control and preserves the STREETS user edit', () => {
  process.env.NEXT_PUBLIC_MAPTILER_KEY = 'public-test-fixture';
  const view = render(<LocationMap />);
  expect(mockMap).toHaveBeenCalledWith(expect.objectContaining({ attributionControl: false, style: 'streets' }));
  expect(screen.getByRole('link', { name: /MapTiler/ })).toHaveAttribute('href', 'https://www.maptiler.com/copyright/');
  expect(screen.getByRole('link', { name: /OpenStreetMap/ })).toHaveAttribute('href', 'https://www.openstreetmap.org/copyright');
  view.unmount();
  expect(mockRemove).toHaveBeenCalledTimes(1);
  delete process.env.NEXT_PUBLIC_MAPTILER_KEY;
});

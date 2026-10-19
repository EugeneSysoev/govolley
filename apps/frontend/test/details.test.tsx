/** @jest-environment node */
import { renderToStaticMarkup } from 'react-dom/server';
import TrainingDetailPage from '@/app/training/[id]/page';
jest.mock('next-auth', () => ({ getServerSession: jest.fn().mockResolvedValue(null) }));
jest.mock('@/lib/auth-options', () => ({ authOptions: {} }));
jest.mock('@/components/background/global-background', () => ({ __esModule: true, default: () => null }));
jest.mock('@/app/training/[id]/booking-sidebar', () => ({ BookingSidebar: () => null }));
it('renders details with location=null using the server backend address', async () => {
  process.env.BACKEND_URL = 'http://127.0.0.1:55440';
  const fetcher = jest.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({
    id: 7, title: 'No location', description: null, date: '2026-11-01T00:00:00.000Z', startTime: '07:00', endTime: '09:00',
    targetLevel: 'BEGINNER', maxParticipants: 10, price: null, coachName: null, location: null,
    isActive: true, currentParticipants: 0, isBooked: false, createdAt: '2026-10-01T00:00:00.000Z', updatedAt: '2026-10-01T00:00:00.000Z',
  })));
  try {
    const element = await TrainingDetailPage({ params: Promise.resolve({ id: '7' }) });
    expect(renderToStaticMarkup(element)).toContain('Локация уточняется');
    expect(fetcher).toHaveBeenCalledWith('http://127.0.0.1:55440/api/training/7', expect.objectContaining({ cache: 'no-store' }));
  } finally { fetcher.mockRestore(); }
});

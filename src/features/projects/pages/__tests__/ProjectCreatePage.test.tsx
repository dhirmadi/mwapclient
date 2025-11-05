import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import ProjectCreatePage from '../ProjectCreatePage';

describe('ProjectCreatePage', () => {
  it('renders wizard steps', async () => {
    render(<ProjectCreatePage />);
    expect(screen.getByText(/Create Project/i)).toBeInTheDocument();
    expect(screen.getByText(/Basic Info/i)).toBeInTheDocument();
    expect(screen.getByText(/Root Folder/i)).toBeInTheDocument();
  });
});



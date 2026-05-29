import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ServiceInfoStep } from '../components/service-info-step'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn(),
}))

describe('ServiceInfoStep Component (T20)', () => {
  it('renders informational title and copy correctly', () => {
    render(<ServiceInfoStep onSuccess={vi.fn()} />)
    expect(screen.getByText('Seus Serviços')).toBeDefined()
    expect(screen.getByText('Personalize tudo no Painel')).toBeDefined()
    expect(screen.getByText(/No painel de controle, você poderá adicionar/)).toBeDefined()
  })

  it('triggers onSuccess when next button is clicked', () => {
    const handleSuccess = vi.fn()
    render(<ServiceInfoStep onSuccess={handleSuccess} />)

    const nextBtn = screen.getByRole('button', { name: 'Próximo' })
    fireEvent.click(nextBtn)
    expect(handleSuccess).toHaveBeenCalledTimes(1)
  })
})

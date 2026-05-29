import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OnboardingShell } from '../components/onboarding-shell'

describe('OnboardingShell Component (T17)', () => {
  it('renders step progress title, subtitle and children', () => {
    render(
      <OnboardingShell
        currentStep={1}
        title="Cadastre seu Negócio"
        subtitle="Insira as informações básicas para iniciar"
      >
        <div data-testid="child-content">Formulário Step 1</div>
      </OnboardingShell>
    )

    expect(screen.getByText('Cadastre seu Negócio')).toBeDefined()
    expect(screen.getByText('Insira as informações básicas para iniciar')).toBeDefined()
    expect(screen.getByTestId('child-content')).toBeDefined()
    // Displays mobile step progress label
    expect(screen.getByText('Passo 1 de 5')).toBeDefined()
  })

  it('triggers onNext when next button is clicked', () => {
    const handleNext = vi.fn()
    render(
      <OnboardingShell
        currentStep={1}
        title="Passo 1"
        subtitle="Sub 1"
        onNext={handleNext}
      >
        <div>Content</div>
      </OnboardingShell>
    )

    const nextBtn = screen.getByRole('button', { name: 'Próximo' })
    fireEvent.click(nextBtn)
    expect(handleNext).toHaveBeenCalledTimes(1)
  })

  it('renders and triggers onSkip and onBack buttons when provided', () => {
    const handleBack = vi.fn()
    const handleSkip = vi.fn()

    render(
      <OnboardingShell
        currentStep={2}
        title="Passo 2"
        subtitle="Sub 2"
        onBack={handleBack}
        onSkip={handleSkip}
      >
        <div>Content</div>
      </OnboardingShell>
    )

    const backBtn = screen.getByRole('button', { name: 'Voltar' })
    const skipBtn = screen.getByRole('button', { name: 'Pular' })

    fireEvent.click(backBtn)
    fireEvent.click(skipBtn)

    expect(handleBack).toHaveBeenCalledTimes(1)
    expect(handleSkip).toHaveBeenCalledTimes(1)
  })

  it('disables buttons and shows loading text when isPending is true', () => {
    const handleNext = vi.fn()
    render(
      <OnboardingShell
        currentStep={2}
        title="Passo 2"
        subtitle="Sub 2"
        onNext={handleNext}
        isPending={true}
      >
        <div>Content</div>
      </OnboardingShell>
    )

    expect(screen.queryByRole('button', { name: 'Próximo' })).toBeNull()
    const loadingBtn = screen.getByRole('button', { name: 'Carregando...' })
    expect(loadingBtn).toBeDisabled()
  })
})

import { newE2EPage } from '@stencil/core/testing'

describe('table-chart-covid', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<table-chart-covid></table-chart-covid>')

    const element = await page.find('table-chart-covid')
    expect(element).toHaveClass('hydrated')
  })
})

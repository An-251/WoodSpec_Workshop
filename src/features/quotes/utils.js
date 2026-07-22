export function getLeadTimeStart(leadTime) {
  return Number.parseInt(leadTime, 10)
}

export function getWarrantyMonths(warranty) {
  return Number.parseInt(warranty, 10)
}

export function getQuoteBreakdown(price, quote) {
  const laborCost = Math.round((price * quote.laborRate) / 100000) * 100000
  const accessoryCost = quote.accessoryCost
  const transportCost = quote.transportCost
  const installationCost = quote.installationCost
  const materialCost = Math.max(0, price - laborCost - accessoryCost - transportCost - installationCost)

  return {
    materialCost,
    laborCost,
    accessoryCost,
    transportCost,
    installationCost,
    deposit: Math.round((price * quote.depositRate) / 100000) * 100000,
  }
}

export function generateQuoteOptions({ configuration, quoteOptions, workshops, sortBy }) {
  const enrichedQuotes = quoteOptions.map((quote) => ({
    ...quote,
    price: Math.round((configuration.estimatedPrice * quote.priceFactor) / 100000) * 100000,
    workshop: workshops.find((workshop) => workshop.id === quote.workshopId),
  }))

  return enrichedQuotes.sort((firstQuote, secondQuote) => {
    if (sortBy === "leadTime") {
      return getLeadTimeStart(firstQuote.leadTime) - getLeadTimeStart(secondQuote.leadTime)
    }

    if (sortBy === "warranty") {
      return getWarrantyMonths(secondQuote.warranty) - getWarrantyMonths(firstQuote.warranty)
    }

    return firstQuote.price - secondQuote.price
  })
}

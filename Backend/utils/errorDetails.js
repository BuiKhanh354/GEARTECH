function getDevelopmentErrorDetails(error) {
  if (process.env.NODE_ENV === 'production') return {}

  return { details: error?.message }
}

module.exports = { getDevelopmentErrorDetails }

class AnalyticsReporter {
  constructor() {
    if (typeof window.dataLayer === 'undefined') {
      console.warn('Google Tag Manager not found.')
    }
  }

  reportEvent(category, action, filter, eventDetail, visualizationName) {
    if (typeof window.dataLayer === 'undefined') { return }

    const dataObject = {
      event: 'tagManagerTest',
      category: category,
      action: action,
      filter: filter,
      label: eventDetail,
      visualization: visualizationName,
    }

    console.log('Sending GA report:', dataObject)
    return window.dataLayer.push(dataObject)
  }
}

module.exports = AnalyticsReporter

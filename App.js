// React
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Utilities
import { useFetch, WpAcfOptionsUrl, WpRestUrl } from '@components/utilities/useFetch/useFetch';

function App() {
  // Query pages
  const { statusPage, dataPage, errorPage } = useFetch('Page', `${WpRestUrl}/pages`);
  const pages = 'pages' in dataPage
    ? dataPage.pages
    : {};

  // Fetch ACF options page data
  const { statusAcf, dataAcf, errorAcf } = useFetch('Acf', `${WpAcfOptionsUrl}`);
  const acf = 'options' in dataAcf && 'acf' in dataAcf.options
    ? dataAcf.options.acf
    : {};

  // Fetch portfolio CPT data
  const { statusPortfolio, dataPortfolio, errorPortfolio } = useFetch('Portfolio', `${WpRestUrl}/portfolio`);
  const portfolio = 'portfolio' in dataPortfolio
    ? dataPortfolio.portfolio
    : {};

  // Render
  return (
    <>
      <Router>
        {(() => {
          if (errorPage === 'error') {
            return (
              <div className='error--errorPage'>Error - Page data</div>
              )
          } else if (errorAcf === 'error') {
            return (
              <div className='error--errorAcf'>Error - ACF data</div>
              )
          } else if (errorPortfolio === 'error') {
            return (
              <div className='error--errorPortfolio'>Error - Portfolio data</div>
              )
          }
        })()}

        {(statusAcf === 'fetching' || statusPortfolio === 'fetching' || statusPage === 'fetching') && <div className="loading"></div>}
        {(statusAcf === 'fetched' && statusPortfolio === 'fetched' && statusPage === 'fetched') && (
          <>
            <GlobalHeader PortfolioData={portfolio} />
              <Routes>
                <Route path="/" element={<Home AcfData={acf} />} />
                <Route path="portfolio" element={<Portfolio PageData={pages} AcfData={acf} PortfolioData={portfolio} />} />
                <Route path="portfolio/:slug" element={<PortfolioSingle AcfData={acf} PortfolioData={portfolio} />} />
                <Route path="about" element={<About PageData={pages} AcfData={acf} />} />
                <Route path="*" element={<Error AcfData={acf} />} />
              </Routes>
            <GlobalFooter />
          </>
        )}
      </Router>
    </>
  );
}

export default App;

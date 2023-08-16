window.addEventListener("DOMContentLoaded", () => {
  // Listen to document to capture dynamically loaded elements
  document.addEventListener("click", (e) => {
    const link = e.target;
    if (
      link.hasAttribute("data-facet-function") &&
      link.hasAttribute("data-facet-params")
    ) {
      // Replaces linkRenderer.setOnclick without using eval()
      const facetFunction = link.dataset.facetFunction;
      const facetParams = link.dataset.facetParams;
      if (facetFunction && facetParams) {
        e.preventDefault();
        window[facetFunction](facetParams, true);
      }
    } else if (link.hasAttribute("data-clicktracking")) {
      // Replaces specifically linkRenderer.setOnclick($hit.clickTrackingCallback)
      const trackMatch = link.dataset.clicktracking.match(/url:'(.+?)',/);
      if (trackMatch) {
        // Fire and forget request to querycallback tracker
        fetch(trackMatch[1]);
      }
    }
  });
});

// Helper method to modify ajax responses
const modifyXhrResponse = (callback) => {
  const originalGet = Object.getOwnPropertyDescriptor(
    XMLHttpRequest.prototype,
    "responseText"
  ).get;
  Object.defineProperty(XMLHttpRequest.prototype, "responseText", {
    get: function () {
      return callback(originalGet.apply(this, arguments));
    },
  });
};

// Handle pagination for search facets
modifyXhrResponse((content) => {
  const searchFacetedPortlet = document.querySelector(
    ".sv-facetedsearch-portlet, .sv-standardsearch-portlet"
  );
  if (!searchFacetedPortlet) {
    return content;
  }
  const regexpPaginationScript =
    /<script[^>]+>\s+svDocReady\(function\(\) {\s+\$svjq\('([^']+)'\)\.pagination\(([\d\D]+?)\);\s+}\);\s+<\/script>/;
  const match = content.match(regexpPaginationScript);
  if (match) {
    const paginationSelector = match[1];
    let paginationOptions = match[2];
    // Add quote marks around keys
    paginationOptions = paginationOptions.replace(/\s(\w+):/gm, `"$1":`);
    // Replace ' with " for values
    paginationOptions = paginationOptions.replace(/'/g, `"`, paginationOptions);

    // Remove script from ajax content
    content = content.replace(match[0], "");

    // Run pagination script after content is loaded
    const observer = new MutationObserver((mutationList, observer) => {
      $svjq(paginationSelector).pagination(JSON.parse(paginationOptions));
      observer.disconnect();
    });
    observer.observe(searchFacetedPortlet, {
      childList: true,
      subtree: true,
    });
  }
  return content;
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('copyButton').addEventListener('click', copySanitizedLink);
    document.getElementById('showTrackingButton').addEventListener('click', toggleTrackingInfo);
    document.getElementById('clearButton').addEventListener('click', clearInputs);
    document.getElementById('shortenButton').addEventListener('click', shortenLink);
    document.getElementById('decodeButton').addEventListener('click', decodeLink);
    document.getElementById('linkInput').addEventListener('input', sanitizeAndDisplay);

    let removedParameters = [];

    function sanitizeAndDisplay() {
        const link = document.getElementById('linkInput').value;
        if (!link) {
            document.getElementById('sanitizedLinkOutput').value = '';
            document.getElementById('sanitizedLinkContainer').style.display = 'none';
            document.getElementById('trackingInfoContainer').style.display = 'none';
            document.getElementById('message').textContent = '';
            document.getElementById('decodedLinkContainer').style.display = 'none';
            document.getElementById('shortenedLinkContainer').style.display = 'none';
            return;
        }
        const sanitizedLink = sanitizeLink(link);

        document.getElementById('sanitizedLinkOutput').value = sanitizedLink;
        document.getElementById('sanitizedLinkContainer').style.display = 'block';
        removedParameters = getRemovedParameters(link);
        document.getElementById('trackingInfoContainer').style.display = 'none';
        document.getElementById('message').textContent = "";
        document.getElementById('decodedLinkContainer').style.display = 'none';
        document.getElementById('shortenedLinkContainer').style.display = 'none';
    }

    function copySanitizedLink() {
        const sanitizedLink = document.getElementById('sanitizedLinkOutput').value;
        if (!sanitizedLink) {
            document.getElementById('message').textContent = "Please paste a link first!";
            return;
        }
        navigator.clipboard.writeText(sanitizedLink)
            .then(() => {
                document.getElementById('message').textContent = 'Sanitized link copied!';
                document.getElementById('sanitizedCheckmark').style.display = 'inline';
                setTimeout(function() {
                    document.getElementById('sanitizedCheckmark').style.display = 'none';
                }, 2000);
            })
            .catch((err) => {
                console.error("Clipboard write error:", err);
                document.getElementById('message').textContent = 'Error: Could not copy link.';
            });
    }

    function sanitizeLink(link) {
        let mainPart = link;
        let queryPart = '';
        let fragmentPart = '';

        if (link.includes('?')) {
            [mainPart, queryPart] = mainPart.split('?');
            if (queryPart.includes('#')) {
                [queryPart, fragmentPart] = queryPart.split('#');
            }
        } else if (link.includes('#')) {
            [mainPart, fragmentPart] = mainPart.split('#');
        }

        let cleanedQuery = queryPart ? sanitizeParameters(queryPart) : '';
        let cleanedFragment = fragmentPart ? sanitizeParameters(fragmentPart) : '';

        let sanitizedLink = mainPart;
        if (cleanedQuery) {
            sanitizedLink += '?' + cleanedQuery;
        }
        if (cleanedFragment) {
            sanitizedLink += '#' + cleanedFragment;
        }

        return sanitizedLink;
    }

    function sanitizeParameters(paramsString) {
      if (!paramsString) return '';
        const parameters = paramsString.split('&');
        const cleanedParameters = parameters.filter(param => {
            const isTracking = isTrackingParameter(param);
            return !isTracking;
        });
        return cleanedParameters.join('&');
    }

    function getRemovedParameters(link) {
        let queryPart = '';
        let fragmentPart = '';
        let mainPart = link;

        if (link.includes('?')) {
            [mainPart, queryPart] = mainPart.split('?');
            if (queryPart.includes('#')) {
                [queryPart, fragmentPart] = queryPart.split('#');
            }
        } else if (link.includes('#')) {
            [mainPart, fragmentPart] = mainPart.split('#');
        }

        const queryParams = queryPart ? queryPart.split('&') : [];
        const fragmentParams = fragmentPart ? fragmentPart.split('&') : [];

        return [...queryParams, ...fragmentParams].filter(param => isTrackingParameter(param));
    }

    function isTrackingParameter(param) {
        const trackingParams = [
            'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
            'fbclid',
            'gclid',
            'dclid',
            'msclkid',
            'mc_cid', 'mc_eid',
            'ref',
            'si',
            's_kwcid',
            'ad_id',
            'adset_id',
            'campaign_id',
            'source_id',
            '_hsenc',
            '_hsmi',
            '__s',
            '__hsfp',
            'hsa_acc',
            'hsa_cam',
            'hsa_grp',
            'hsa_ad',
            'hsa_src',
            'hsa_net',
            'hsa_ver',
            'trk_contact',
            'trk_module',
            'trk_sid'
        ];
        return trackingParams.some(trackingParam => param.startsWith(trackingParam + '='));
    }

    function toggleTrackingInfo() {
        const trackingInfoContainer = document.getElementById('trackingInfoContainer');
        const trackingParametersList = document.getElementById('trackingParametersList');

        if (trackingInfoContainer.style.display === 'none') {
            trackingParametersList.innerHTML = '';
            removedParameters.forEach(param => {
                const listItem = document.createElement('li');
                listItem.textContent = param;
                trackingParametersList.appendChild(listItem);
            });
            trackingInfoContainer.style.display = 'block';
        } else {
            trackingInfoContainer.style.display = 'none';
        }
    }

    function clearInputs() {
        document.getElementById('linkInput').value = '';
        document.getElementById('sanitizedLinkOutput').value = '';
        document.getElementById('shortenedLinkOutput').value = '';
        document.getElementById('decodedLinkOutput').value = '';
        document.getElementById('sanitizedLinkContainer').style.display = 'none';
        document.getElementById('trackingInfoContainer').style.display = 'none';
        document.getElementById('shortenedLinkContainer').style.display = 'none';
        document.getElementById('decodedLinkContainer').style.display = 'none';
        document.getElementById('message').textContent = '';
    }

    function shortenLink() {
      const link = document.getElementById('sanitizedLinkOutput').value;
      if (!link) {
        document.getElementById('message').textContent = 'Please paste a link first!';
        return;
      }

      document.getElementById('shorteningProgress').style.display = 'block';

      const apiUrl = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(link)}`;

      fetch(apiUrl)
        .then(response => response.text())
        .then(shortenedUrl => {
          document.getElementById('shortenedLinkOutput').value = shortenedUrl;
          document.getElementById('shortenedLinkContainer').style.display = 'block';
          document.getElementById('message').textContent = 'Link shortened!';
          document.getElementById('shorteningProgress').style.display = 'none';
        })
        .catch(error => {
          console.error('Error shortening link:', error);
          document.getElementById('message').textContent = 'Error shortening link.';
          document.getElementById('shorteningProgress').style.display = 'none';
        });
    }

    function decodeUrl(url) {
      try {
        return decodeURIComponent(url);
      } catch (e) {
        return url;
      }
    }

    function decodeLink() {
        const link = document.getElementById('linkInput').value;
        if (!link) {
            document.getElementById('message').textContent = 'Please paste a link to decode!';
            return;
        }
        const decodedLink = decodeUrl(link);
        document.getElementById('decodedLinkOutput').value = decodedLink;
        document.getElementById('decodedLinkContainer').style.display = 'block';
        document.getElementById('message').textContent = 'Link decoded!';
    }

    chrome.storage.sync.get('firstUse', function(data) {
        if(chrome.storage && chrome.storage.sync){
            if (data.firstUse === undefined) {
                document.getElementById('message').textContent = "Welcome! Paste a link to get started.";
                chrome.storage.sync.set({firstUse: false}); // Set firstUse to false after first use
            } 
        }
    }
    );
});
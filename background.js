// Listens for a click on the extension's toolbar icon
chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: StartJob
    });
});

function StartJob() {
	var jobLog = "";
	var logPopupTextSpan = null;
	
	var logIt = function(text) {
		jobLog += text + "\n";
		console.log(text);
		
		if (logPopupTextSpan === null) {
			addLogPopup();
		} else {			
			logPopupTextSpan.textContent = jobLog;
		}
	};
	
	var addLogPopup = function() {
		// Create wrapper container
		const containerDiv = document.createElement('div');

		Object.assign(containerDiv.style, {
			position: 'fixed',
			top: '20px',
			right: '20px',
			zIndex: '9999',
			backgroundColor: '#222222',
			color: '#ffffff',
			padding: '15px 40px 15px 15px',
			borderRadius: '8px',
			boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
			fontFamily: 'Arial, sans-serif',
			whiteSpace: 'pre-line'
		});

		// Create text content span
		logPopupTextSpan = document.createElement('span');
		logPopupTextSpan.textContent = jobLog;
		containerDiv.appendChild(logPopupTextSpan);

		// Create the close button
		const closeButton = document.createElement('button');
		closeButton.textContent = 'Close';

		Object.assign(closeButton.style, {
			position: 'absolute',
			top: '5px',
			right: '10px',
			background: 'none',
			border: 'none',
			color: '#ffffff',
			fontSize: '25px',
			cursor: 'pointer',
			lineHeight: '1',
			padding: '0'
		});

		// Close event.
		closeButton.addEventListener('click', () => {
			containerDiv.remove();
		});

		// Add popup into the page.
		containerDiv.appendChild(closeButton);
		document.body.appendChild(containerDiv);
	};
	
    var executeNextItem = function (profiles, index) {
		if (index < 0) {
			logIt("Facebook Recommended Page Blocker is done.");
			return;
		}
        const eachProfile = profiles[index];

        const profileTitle = eachProfile.textContent.trim();
        if (!profileTitle.endsWith("Follow") && !profileTitle.endsWith("Join")) { 
				
			logIt(profileTitle + " is safe. Not blocking.");
			executeNextItem(profiles, index - 1);
			return; 
		}

        const profileButtonsContainer = eachProfile.parentNode?.parentNode?.parentNode?.parentNode?.parentNode;
        const buttons = profileButtonsContainer?.querySelectorAll('div[role="button"]');
        if (!buttons || buttons.length < 2) { return; }

        buttons[1].click(); // Click on "..." button to open the menu
        //await delay(2000);		
		// wait 2 secs.
        setTimeout(() => {
            const menu = document.querySelector('div[role="menu"]');
            const menuItems = menu?.querySelectorAll('div[role="button"]') ?? [];

            for (let menuIndex = menuItems.length - 1; menuIndex >= 0; menuIndex--) {
                const eachMenuItem = menuItems[menuIndex];
                if (eachMenuItem.textContent.trim().startsWith("Block ")) {
					// Click on "Block" button.
                    eachMenuItem.click();
                    logIt(profileTitle + " blocked.");
					
					executeNextItem(profiles, index - 1);
                    break;
                }
            }
        }, 2000);
    };

    logIt("Facebook Recommended Page Blocker Started...");

    const profiles = document.querySelectorAll('div[data-ad-rendering-role="profile_name"]');

    console.log("Found " + profiles.length + " profiles...");
    if (profiles.length > 0) {
        executeNextItem(profiles, profiles.length - 1);
    }

}
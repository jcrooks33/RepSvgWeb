// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Constants and Data Structures
    const stateAbbreviations = {
        'alabama': 'AL',
        'alaska': 'AK',
        'arizona': 'AZ',
        'arkansas': 'AR',
        'california': 'CA',
        'colorado': 'CO',
        'connecticut': 'CT',
        'delaware': 'DE',
        'florida': 'FL',
        'georgia': 'GA',
        'hawaii': 'HI',
        'idaho': 'ID',
        'illinois': 'IL',
        'indiana': 'IN',
        'iowa': 'IA',
        'kansas': 'KS',
        'kentucky': 'KY',
        'louisiana': 'LA',
        'maine': 'ME',
        'maryland': 'MD',
        'massachusetts': 'MA',
        'michigan': 'MI',
        'minnesota': 'MN',
        'mississippi': 'MS',
        'missouri': 'MO',
        'montana': 'MT',
        'nebraska': 'NE',
        'nevada': 'NV',
        'new-hampshire': 'NH',
        'new-jersey': 'NJ',
        'new-mexico': 'NM',
        'new-york': 'NY',
        'north-carolina': 'NC',
        'north-dakota': 'ND',
        'ohio': 'OH',
        'oklahoma': 'OK',
        'oregon': 'OR',
        'pennsylvania': 'PA',
        'rhode-island': 'RI',
        'south-carolina': 'SC',
        'south-dakota': 'SD',
        'tennessee': 'TN',
        'texas': 'TX',
        'utah': 'UT',
        'vermont': 'VT',
        'virginia': 'VA',
        'washington': 'WA',
        'west-virginia': 'WV',
        'wisconsin': 'WI',
        'wyoming': 'WY'
    };

    // Assuming stateOptions and districtToRep are loaded from external JSON files
    let stateOptions = {};
    let districtToRep = {};

    // Elements
    const stateDropdown = document.getElementById("stateDropdown");
    const dependentDropdown = document.getElementById("dependentDropdown");
    const signupForm = document.getElementById("signupForm");
    const statusMessage = document.getElementById("statusMessage");
    const stateTitle = document.getElementById('state-title');
    const stateContainer = document.getElementById('state-container');
    const hoverInfo = document.getElementById('hover-info');
    const clickInfo = document.getElementById('click-info');

    // Fetch Data
    const fetchData = async () => {
        try {
            const [stateOptionsResponse, districtToRepResponse] = await Promise.all([
                fetch('/data/stateOptions.json'),
                fetch('/data/districtToRep.json')
            ]);

            if (!stateOptionsResponse.ok || !districtToRepResponse.ok) {
                throw new Error('Failed to load data files.');
            }

            stateOptions = await stateOptionsResponse.json();
            districtToRep = await districtToRepResponse.json();
            populateStateDropdown();
        } catch (error) {
            console.error(error);
            statusMessage.textContent = "Error loading data. Please try again later.";
            statusMessage.style.color = "red";
        }
    };

    // Populate State Dropdown
    const populateStateDropdown = () => {
        const fragment = document.createDocumentFragment();
        Object.keys(stateAbbreviations).sort().forEach(stateName => {
            const option = document.createElement('option');
            option.value = stateAbbreviations[stateName];
            option.textContent = capitalizeWords(stateName.replace(/-/g, ' '));
            fragment.appendChild(option);
        });
        stateDropdown.appendChild(fragment);
    };

    // Capitalize Words Utility Function
    const capitalizeWords = (str) => {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    };

    // Handle State Selection Change
    const handleStateChange = (event) => {
        const selectedState = event.target.value;
        populateDependentDropdown(selectedState);
        loadStateSvg(getStateNameByAbbr(selectedState), selectedState);
    };

    // Helper Function to Get State Name by Abbreviation
    const getStateNameByAbbr = (abbr) => {
        return Object.keys(stateAbbreviations).find(key => stateAbbreviations[key] === abbr);
    };

    // Populate Dependent Dropdown (Representatives)
    const populateDependentDropdown = (stateAbbr) => {
        dependentDropdown.innerHTML = '<option value="" disabled selected>Select your representative</option>';
        if (stateOptions[stateAbbr] && stateOptions[stateAbbr].length > 0) {
            const fragment = document.createDocumentFragment();
            stateOptions[stateAbbr].forEach(rep => {
                const option = document.createElement('option');
                option.value = rep;
                option.textContent = rep;
                fragment.appendChild(option);
            });
            dependentDropdown.appendChild(fragment);
            dependentDropdown.disabled = false;
        } else {
            dependentDropdown.innerHTML = '<option value="" disabled selected>No representatives available</option>';
            dependentDropdown.disabled = true;
        }
    };

    // Handle Form Submission
    const handleFormSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData(signupForm);
        const email = formData.get("email").trim();
        const state = formData.get("state");
        const rep_name = formData.get("rep_name");

        // Basic Client-side Validation
        if (!validateEmail(email)) {
            statusMessage.textContent = "Please enter a valid email address.";
            statusMessage.style.color = "red";
            return;
        }

        try {
            // Show loading message
            statusMessage.textContent = "Submitting...";
            statusMessage.style.color = "black";

            const response = await fetch("/api/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, state, rep_name })
            });

            const resJson = await response.json();

            if (!response.ok) {
                throw new Error(resJson.error || "Unknown error occurred.");
            }

            statusMessage.textContent = resJson.message || "Subscription successful!";
            statusMessage.style.color = "green";
            signupForm.reset();
            dependentDropdown.innerHTML = '<option value="" disabled selected>Please select a state first</option>';
            dependentDropdown.disabled = true;
        } catch (error) {
            console.error(error);
            statusMessage.textContent = "Error: " + error.message;
            statusMessage.style.color = "red";
        }
    };

    // Email Validation Function
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email.toLowerCase());
    };

    // Add Event Listeners
    stateDropdown.addEventListener("change", handleStateChange);
    signupForm.addEventListener("submit", handleFormSubmit);

    const addSvgInteractivity = (svgElement, stateAbbreviation) => {
        if (!svgElement) {
            console.error('SVG element not found in the container.');
            return;
        }
    
        let selectedElement = null;
    
        // Function to handle mouse movement and position the tooltip
        const handleMouseMove = (e) => {
            const tooltipWidth = hoverInfo.offsetWidth;
            const tooltipHeight = hoverInfo.offsetHeight;
            const padding = 10; // Distance between cursor and tooltip
    
            // Calculate tooltip position
            let posX = e.pageX + padding;
            let posY = e.pageY + padding;
    
            // Prevent tooltip from going off the right edge
            if (posX + tooltipWidth > window.innerWidth) {
                posX = e.pageX - tooltipWidth - padding;
            }
    
            // Prevent tooltip from going off the bottom edge
            if (posY + tooltipHeight > window.innerHeight) {
                posY = e.pageY - tooltipHeight - padding;
            }
    
            // Set tooltip position
            hoverInfo.style.left = `${posX}px`;
            hoverInfo.style.top = `${posY}px`;
        };
    
        const handleMouseOver = (e) => {
            const target = e.target;
            if (isInteractive(target, stateAbbreviation)) {
                target.classList.add('highlight');
    
                // Retrieve the representative's name from districtToRep
                const repName = districtToRep[target.id];
                if (repName) {
                    hoverInfo.textContent = `Representative: ${repName}`;
                } else {
                    hoverInfo.textContent = `Representative: Not Found`;
                }
    
                // Show the tooltip
                hoverInfo.style.display = 'block';
    
                // Add mousemove listener to update tooltip position
                svgElement.addEventListener('mousemove', handleMouseMove);
            }
        };
    
        const handleMouseOut = (e) => {
            const target = e.target;
            if (isInteractive(target, stateAbbreviation)) {
                target.classList.remove('highlight');
                hoverInfo.style.display = 'none';
                hoverInfo.textContent = '';
                // Remove mousemove listener when not hovering
                svgElement.removeEventListener('mousemove', handleMouseMove);
            }
        };
    
        const handleClick = (e) => {
            const target = e.target;
            if (isInteractive(target, stateAbbreviation)) {
                if (selectedElement && selectedElement !== target) {
                    selectedElement.classList.remove('selected');
                }
    
                if (target.classList.contains('selected')) {
                    target.classList.remove('selected');
                    clickInfo.textContent = 'No region selected.';
                    selectedElement = null;
                } else {
                    target.classList.add('selected');
                    clickInfo.textContent = `Selected Congressional District: ${target.id}`;
                    selectedElement = target;
    
                    const repName = districtToRep[target.id];
                    if (repName) {
                        // Update the dependent dropdown to reflect the selected representative
                        if (stateOptions[stateAbbreviation]?.includes(repName)) {
                            dependentDropdown.value = repName;
                            clickInfo.textContent += ` | Representative Selected: ${repName}`;
                        } else {
                            const newOption = document.createElement("option");
                            newOption.value = repName;
                            newOption.textContent = repName;
                            dependentDropdown.appendChild(newOption);
                            dependentDropdown.value = repName;
                            clickInfo.textContent += ` | Representative Selected: ${repName} (Added)`;
                        }
                    } else {
                        console.warn(`No representative mapped for district ID: ${target.id}`);
                    }
                }
            }
        };
    
        const isInteractive = (element, stateAbbr) => {
            return element && element.id && element.id.startsWith(stateAbbr);
        };
    
        svgElement.addEventListener('mouseover', handleMouseOver);
        svgElement.addEventListener('mouseout', handleMouseOut);
        svgElement.addEventListener('click', handleClick);
    
        // Optionally, make SVG elements focusable for accessibility
        const interactiveElements = svgElement.querySelectorAll(`[id^="${stateAbbreviation}"]`);
        interactiveElements.forEach(el => {
            el.setAttribute('tabindex', '0');
            el.setAttribute('role', 'button');
            el.setAttribute('aria-label', `District ${el.id}`);
        });
    };

    // Load SVG Based on State
    const loadStateSvg = (stateName, stateAbbr) => {
        const svgPath = `states/${stateName.toLowerCase().replace(/\s+/g, '-')}.svg`;
        fetch(svgPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error('SVG not found.');
                }
                return response.text();
            })
            .then(svgContent => {
                stateContainer.innerHTML = svgContent;
                const svgElement = stateContainer.querySelector('svg');
                addSvgInteractivity(svgElement, stateAbbr);
            })
            .catch(error => {
                console.error(error);
                stateContainer.innerHTML = '<p>SVG not available.</p>';
            });
    };

    // Handle URL Parameters for Preselection
    const handleUrlParameters = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const stateName = urlParams.get('state');
        const repName = urlParams.get('rep');

        if (stateName) {
            const stateKey = stateName.toLowerCase().replace(/\s+/g, '-');
            const stateAbbr = stateAbbreviations[stateKey];

            if (!stateAbbr) {
                console.error('Invalid state name provided.');
                stateTitle.textContent = 'Invalid State';
                stateContainer.innerHTML = '<p>Invalid state selected.</p>';
                return;
            }

            // Preselect the state in the dropdown
            stateDropdown.value = stateAbbr;
            populateDependentDropdown(stateAbbr);

            // Load the SVG
            loadStateSvg(stateName, stateAbbr);

            // Update the state title
            //stateTitle.textContent = `${capitalizeWords(stateKey)} Details`;

            // Preselect the representative if provided
            if (repName && stateOptions[stateAbbr]?.includes(repName)) {
                // Wait until the dropdown is populated
                setTimeout(() => {
                    dependentDropdown.value = repName;
                }, 100);
            }
        } else {
            // Default message when no state is selected
            stateTitle.textContent = 'Select a State';
            stateContainer.innerHTML = '<p>No state selected.</p>';
        }
    };
    const addZoomFunctionality = (svgElement) => {
        if (!svgElement) return;
    
        let zoomLevel = 1;
        let panX = 0, panY = 0;
    
        const zoomContainer = svgElement.parentElement;
    
        // Set initial transform
        svgElement.style.transformOrigin = "0 0";
        svgElement.style.transform = `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`;
    
        // Update transform function
        const updateTransform = () => {
            svgElement.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
        };
    
        // Zoom Buttons
        const zoomInButton = document.getElementById("zoom-in");
        const zoomOutButton = document.getElementById("zoom-out");
    
        zoomInButton.addEventListener("click", () => {
            zoomLevel = Math.min(zoomLevel + 0.1, 5); // Max zoom level: 5
            updateTransform();
        });
    
        zoomOutButton.addEventListener("click", () => {
            zoomLevel = Math.max(zoomLevel - 0.1, 0.5); // Min zoom level: 0.5
            updateTransform();
        });
    
        // Panning remains the same as before
        let isPanning = false;
        let startX, startY;
    
        const handleMouseDown = (event) => {
            isPanning = true;
            startX = event.clientX - panX;
            startY = event.clientY - panY;
            zoomContainer.style.cursor = "move";
        };
    
        const handleMouseMove = (event) => {
            if (!isPanning) return;
            panX = event.clientX - startX;
            panY = event.clientY - startY;
            updateTransform();
        };
    
        const handleMouseUp = () => {
            isPanning = false;
            zoomContainer.style.cursor = "default";
        };
    
        // Attach event listeners for panning
        zoomContainer.addEventListener("mousedown", handleMouseDown);
        zoomContainer.addEventListener("mousemove", handleMouseMove);
        zoomContainer.addEventListener("mouseup", handleMouseUp);
        zoomContainer.addEventListener("mouseleave", handleMouseUp);
    };
    const initZoom = () => {
        const svgElement = document.querySelector("#state-container svg");
        if (svgElement) {
            addZoomFunctionality(svgElement);
        }
    };
    
    document.addEventListener("DOMContentLoaded", initZoom);
    // Initialize the Application
    const init = async () => {
        await fetchData();
        handleUrlParameters();
    };
    
    init();
});

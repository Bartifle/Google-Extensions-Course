const tabs = await chrome.tabs.query({
    url: ["https://developer.chrome.com/docs/webstore/*", "https://developer.chrome.com/docs/extensions/*"],
});

const collator = new Intl.Collator();
tabs.sort((a, b) => collator.compare(a.title, b.title));

const template = document.getElementById("li_template");
const elements = new Set();
for (const tab of tabs) {
    const element = template.content.firstElementChild.cloneNode(true);

    const title = tab.title.split("-")[0].trim();
    const pathname = new URL(tab.url).pathname.slice("/docs".length);

    element.querySelector(".title").textContent = title;
    element.querySelector(".pathname").textContent = pathname;
    element.querySelector("a").addEventListener("click", async () => {
        // need to focus window as well as the active tab
        await chrome.tabs.update(tab.id, { active: true });
        await chrome.windows.update(tab.windowId, { focused: true });
    });

    elements.add(element);
}
document.querySelector("ul").append(...elements);

async function tabGroupExistsByTitle(title) {
    await chrome.tabGroups.query({ title: title }, function (groups) {
        return groups.length > 0;
    });
}

const button = document.querySelector("button");
button.addEventListener("click", async () => {
    try {
        const tabIds = tabs.map(({ id }) => id);
        const groupe = await chrome.tabGroups.query({ title: "DOCS" });

        if (groupe.length > 0) {
            await chrome.tabs.ungroup(tabIds);
        } else {
            if (tabIds.length) {
                const group = await chrome.tabs.group({ tabIds });
                await chrome.tabGroups.update(group, { title: "DOCS" });
            }
        }
    } catch (error) {
        console.log(error);
    }
});

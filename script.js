(() => {
    "use strict";

    const config = V9PV_CONFIG;
    const releases = Array.isArray(V9PV_RELEASES) ? V9PV_RELEASES : [];

    const setText = () => {
        document.querySelectorAll("[data-config]").forEach((element) => {
            const key = element.dataset.config;
            const value = config[key];
            element.textContent = value == null ? "" : String(value);
        });

        document.querySelectorAll("[data-github-link]").forEach((link) => {
            link.href = config.githubUrl;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
        });

        document.querySelectorAll("[data-current-year]").forEach((element) => {
            element.textContent = String(new Date().getFullYear());
        });

        const fileSize = String(config.fileSize || "").trim();
        document.querySelectorAll("[data-file-size]").forEach((element) => {
            element.hidden = fileSize === "";
        });

        const releaseDate = String(config.releaseDate || "").trim();
        document.querySelectorAll("[data-release-date-row]").forEach((element) => {
            element.hidden = releaseDate === "";
        });

        const sha256 = String(config.sha256 || "").trim();
        document.querySelectorAll("[data-checksum-section]").forEach((element) => {
            element.hidden = sha256 === "";
        });
    };

    const modal = document.querySelector("[data-download-modal]");
    let lastFocusedElement = null;

    const openModal = () => {
        if (!modal) return;
        lastFocusedElement = document.activeElement;
        modal.hidden = false;
        document.body.classList.add("modal-open");
        const closeButton = modal.querySelector("[data-modal-close]");
        if (closeButton) closeButton.focus();
    };

    const closeModal = () => {
        if (!modal) return;
        modal.hidden = true;
        document.body.classList.remove("modal-open");
        if (lastFocusedElement instanceof HTMLElement) {
            lastFocusedElement.focus();
        }
    };

    const startDownload = (url) => {
        const safeUrl = String(url || "").trim();
        if (!safeUrl) {
            openModal();
            return;
        }

        window.location.assign(safeUrl);
    };

    document.querySelectorAll("[data-download-button]").forEach((button) => {
        button.addEventListener("click", () => startDownload(config.downloadUrl));
    });

    document.querySelectorAll("[data-modal-close]").forEach((button) => {
        button.addEventListener("click", closeModal);
    });

    if (modal) {
        modal.addEventListener("click", (event) => {
            if (event.target === modal) closeModal();
        });
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal && !modal.hidden) {
            closeModal();
        }
    });

    const copyChecksum = async () => {
        const checksum = String(config.sha256 || "").trim();
        if (!checksum) return;

        const button = document.querySelector("[data-copy-checksum]");
        const originalText = button ? button.textContent : "COPY";

        try {
            await navigator.clipboard.writeText(checksum);
        } catch {
            const textarea = document.createElement("textarea");
            textarea.value = checksum;
            textarea.setAttribute("readonly", "");
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            textarea.remove();
        }

        if (button) {
            button.textContent = "COPIED";
            window.setTimeout(() => {
                button.textContent = originalText;
            }, 1400);
        }
    };

    const copyButton = document.querySelector("[data-copy-checksum]");
    if (copyButton) {
        copyButton.addEventListener("click", copyChecksum);
    }

    const renderReleases = () => {
        const list = document.querySelector("[data-releases-list]");
        if (!list) return;

        list.replaceChildren();

        releases.forEach((release) => {
            const row = document.createElement("article");
            row.className = "card release-row";

            const meta = document.createElement("div");
            meta.className = "release-meta";

            const title = document.createElement("strong");
            title.textContent = `v${release.version} — Minecraft ${release.minecraft}`;

            const file = document.createElement("span");
            file.textContent = release.fileName;

            meta.append(title, file);

            const actions = document.createElement("div");
            actions.className = "release-actions";

            const downloadButton = document.createElement("button");
            downloadButton.className = "button button-small button-primary";
            downloadButton.type = "button";
            downloadButton.textContent = "DOWNLOAD";
            downloadButton.addEventListener("click", () => startDownload(release.downloadUrl));

            actions.append(downloadButton);
            row.append(meta, actions);
            list.append(row);
        });
    };

    setText();
    renderReleases();
})();

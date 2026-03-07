document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll(".navbar-nav .nav-link");
    const currentPath = window.location.pathname.replace(/\/$/, "");

    links.forEach(link => {
        const linkPath = new URL(link.href).pathname.replace(/\/$/, "");
        if (linkPath === currentPath) {
            link.classList.add("active");
        }
    });
});
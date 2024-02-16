<script lang="ts">
  import { faivmodal } from "@tuentyfaiv/svelte-modal";
  import { modeCurrent } from "@skeletonlabs/skeleton";
  import { page } from "$app/stores";

  import "./Header.postcss";

  import IconBlog from "@icons/icon-blog.png";
  import IconProjects from "@icons/icon-home.png";
  import IconGitHub from "@icons/icon-github.png";
  import IconLinkedIn from "@icons/icon-linkedin.png";

  import { ThemeSwitch } from "@sharing/atoms";

  const desktop = faivmodal({
    query: "(min-width: 768px)",
  });
  const { device } = $desktop;

  $: IconHome = !$modeCurrent ? "/logo_dark@3x.webp" : "/logo@3x.webp";

  $: links = [
    {
      icon: IconHome,
      content: "Home",
      href: "/",
    },
    {
      icon: IconProjects,
      content: "Projects",
      href: "/projects",
    },
    {
      icon: IconBlog,
      content: "Blog",
      href: "/blog",
    },
  ];

  const socials = [
    {
      onlyDesktop: false,
      icon: IconGitHub,
      content: "GitHub",
      href: "https://github.com/TuentyFaiv",
    },
    {
      // onlyDesktop: true,
      onlyDesktop: false,
      icon: IconLinkedIn,
      content: "LinkedIn",
      href: "https://www.linkedin.com/in/tuentyfaiv",
    },
  ];

  let overlink: HTMLSpanElement;
  let width = 0;
  let left = 0;
  let opacity: 0 | 1 = 0;

  function showOverlink({ target }: MouseEvent | FocusEvent) {
    const size = (target as HTMLAnchorElement).getBoundingClientRect();
    width = size.width;
    left = size.left;
    opacity = 1;
  }

  function hideOverlink() {
    opacity = 0;
  }
</script>

<header class="header">
  <!-- <nav class="header__nav">
    {#if $device}
      <span
        class="header__overlink"
        bind:this={overlink}
        style:opacity
        style:width="{width}px"
        style:transform="translateX({left}px)"
      />
    {/if}
    <ul class="header__list">
      {#each links as { href, content, icon }}
        <li
          class="header__item{href !== '/blog' ? ' header__item--rounded' : ''}"
        >
          <a
            {href}
            class="header__link"
            class:header__link--active={href === $page.url.pathname}
            on:focus={$device ? showOverlink : undefined}
            on:mouseenter|stopPropagation={$device ? showOverlink : undefined}
            on:blur={$device ? hideOverlink : undefined}
            on:mouseleave|stopPropagation={$device ? hideOverlink : undefined}
          >
            <span class="header__icon-wrapper">
              <img src={icon} alt="{content} icon" class="header__icon" />
            </span>
            <span class="header__link-text">
              {content}
            </span>
          </a>
        </li>
      {/each}
    </ul>
  </nav> -->
  <div class="header__actions">
    <ThemeSwitch />
    {#each socials as { href, content, icon, onlyDesktop }}
      {#if $device || !onlyDesktop}
        <a
          {href}
          class="header__link header__icon-wrapper"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={icon} alt="{content} icon" class="header__icon" />
        </a>
      {/if}
    {/each}
  </div>
</header>

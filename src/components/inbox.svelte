<script>
  import { messagesStore, uiErrorsStore } from "../libs/store";
  export let i18n, refreshHook, deleteHook, moveMessageHook;
  let messages = [];

  messagesStore.subscribe((value) => {
    messages = value;
  });

  let uiErrors = [];
    uiErrorsStore.subscribe(value => {
    uiErrors = value;
  });

  // Reactive statement to update the select all icon
  $: selectAllIcon =
    messages.length === messages.filter((message) => message.checked).length
      ? "#iconCheck"
      : "#iconUncheck";

  function toggleSelectAll() {
    messages.forEach((message) => {
      message.checked = !message.checked;
    });
    messages = messages; // Force update
  }

  function toggleMessageChecked(message) {
    message.checked = !message.checked;
    messages = messages; // Trigger reactivity
  }

  // Function to delete checked messages
  function deleteCheckedMessages() {
    messages = messages.filter((message) => !message.checked);
    messagesStore.set(messages); // Update the store
    deleteHook();
  }
</script>

<div class="fn__flex-1 fn__flex-column file-tree">
  <div class="block__icons">
    <div class="block__logo">
      <svg class="block__logoicon"><use xlink:href="#iconTelegram"></use></svg>
      {i18n.dock.title}
    </div>
    <span class="fn__flex-1 fn__space"></span>
    <button
      data-type="selectall"
      class="block__icon b3-tooltips b3-tooltips__w"
      aria-label={i18n.inboxComponent.icons.selectAll}
      on:click={toggleSelectAll}
      on:keydown={(event) => event.key === "Enter" && toggleSelectAll()}
    >
      <svg><use xlink:href={selectAllIcon}></use></svg>
    </button>
    <span class="fn__flex-1 fn__space"></span>
    <button
      data-type="movemessage"
      class="block__icon b3-tooltips b3-tooltips__w"
      aria-label={i18n.inboxComponent.icons.moveMessage}
      on:click={moveMessageHook}
      ><svg><use xlink:href="#iconCalendar"></use></svg></button
    >
    <span class="fn__flex-1 fn__space"></span>
    <button
      data-type="delete"
      class="block__icon b3-tooltips b3-tooltips__w"
      aria-label={i18n.inboxComponent.icons.delete}
      on:click={deleteCheckedMessages}
      ><svg><use xlink:href="#iconDeleteRow"></use></svg></button
    >
    <span class="fn__flex-1 fn__space"></span>
    <button
      data-type="refresh"
      class="block__icon b3-tooltips b3-tooltips__w"
      on:click={refreshHook}
      aria-label={i18n.inboxComponent.icons.refresh}
      ><svg><use xlink:href="#iconRefresh"></use></svg></button
    >
    <span class="fn__flex-1 fn__space"></span>
    <span
      data-type="min"
      class="block__icon b3-tooltips b3-tooltips__sw"
      aria-label={i18n.inboxComponent.icons.min}
      ><svg class="block__logoicon"><use xlink:href="#iconMin"></use></svg
      ></span
    >
  </div>
  <div class="fn__flex-1 inbox-content">
    <ul
      class="b3-list b3-list--background"
      style="min-height: auto;transition: var(--b3-transition)"
    >
      {#if uiErrors.length > 0}
        {#each uiErrors as error}
          <li class="b3-list-item b3-list-item--error">{error}</li>
        {/each}
      {:else}
        {#if messages.length === 0}
          <ul>
            <li class="b3-list--empty">{i18n.inboxComponent.emptyInbox}</li>
          </ul>
        {:else}
          {#each messages as message (message.id)}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            <li
              class="b3-list-item b3-list-item--hide-action"
              on:click={() => toggleMessageChecked(message)}
            >
              <input
                type="checkbox"
                class="inbox__checkbox"
                bind:checked={message.checked}
                on:click|stopPropagation
              />
              {#if message.text}
              <span class="b3-list-item__text" title={message.text}>
                {message.text}
              </span>
              {:else if message.attachments && message.attachments.length > 0}
              <span class="b3-list-item__text" title={message.attachments.map(attachment => attachment.fileName).join(', ')}>
                {message.attachments.map(attachment => attachment.fileName).join(', ')}
              </span>
              {:else}
                {i18n.inboxComponent.unsupportedMessage}
              {/if}
            </li>
          {/each}
        {/if}
      {/if}
    </ul>
  </div>
</div>

<style>
  .inbox__checkbox {
    margin: 0px 6px 0px 0;
  }
  .b3-list-item--hide-action {
    cursor: pointer;
  }
  .inbox-content {
    position: absolute;
    top: 42px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    overflow: auto;
  }
</style>

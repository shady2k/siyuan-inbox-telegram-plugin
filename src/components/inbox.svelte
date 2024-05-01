<script>
  import { messagesStore } from "../libs/store";
  export let refreshHook, deleteHook;
  let messages = [];
  let checkedMessages = new Set();

  messagesStore.subscribe((value) => {
    messages = value;
  });

  // Reactive statement to update the select all icon
  $: selectAllIcon =
    messages.length === checkedMessages.size ? "#iconCheck" : "#iconUncheck";

  function toggleSelectAll() {
    const areAllSelected = messages.length === checkedMessages.size;
    if (areAllSelected) {
      checkedMessages.clear();
    } else {
      messages.forEach((message) => checkedMessages.add(message));
    }
    checkedMessages = new Set(checkedMessages); // Trigger reactivity
  }

  // Function to handle checkbox change
  function handleCheckboxChange(message, event) {
    if (event.target.checked) {
      checkedMessages.add(message);
    } else {
      checkedMessages.delete(message);
    }
  }

  // Function to delete checked messages
  function deleteCheckedMessages() {
    messages = messages.filter((message) => !checkedMessages.has(message));
    checkedMessages.clear(); // Clear the set after deletion
    messagesStore.set(messages); // Update the store with the new messages array
    deleteHook();
  }
</script>

<div class="fn__flex-1 fn__flex-column">
  <div class="block__icons">
    <div class="block__logo">
      <svg class="block__logoicon"><use xlink:href="#iconInbox"></use></svg>
      Telegram Inbox
    </div>
    <span class="fn__flex-1 fn__space"></span>
    <button
    data-type="selectall"
    class="block__icon b3-tooltips b3-tooltips__w"
    aria-label="Select all"
    on:click={toggleSelectAll}
    on:keydown={(event) => event.key === 'Enter' && toggleSelectAll()}
  >
    <svg><use xlink:href={selectAllIcon}></use></svg>
  </button>
    <span class="fn__flex-1 fn__space"></span>
    <span
      data-type="selectall"
      class="block__icon b3-tooltips b3-tooltips__w"
      aria-label="Move to Daily notes"
      ><svg><use xlink:href="#iconCalendar"></use></svg></span
    >
    <span class="fn__flex-1 fn__space"></span>
    <button
      data-type="selectall"
      class="block__icon b3-tooltips b3-tooltips__w"
      aria-label="Delete"
      on:click={deleteCheckedMessages}
      ><svg><use xlink:href="#iconDeleteRow"></use></svg></button
    >
    <span class="fn__flex-1 fn__space"></span>
    <button
      data-type="refresh"
      class="block__icon b3-tooltips b3-tooltips__w"
      on:click={refreshHook}
      aria-label="Refresh"><svg><use xlink:href="#iconRefresh"></use></svg></button
    >
    <span class="fn__flex-1 fn__space"></span>
    <span
      data-type="min"
      class="block__icon b3-tooltips b3-tooltips__sw"
      aria-label="Min"
      ><svg class="block__logoicon"><use xlink:href="#iconMin"></use></svg
      ></span
    >
  </div>
  <div class="fn__flex-1">
    <ul class="b3-list b3-list--background">
      {#if messages.length === 0}
        <ul>
          <li class="b3-list--empty">
            Let's send some messages to your Telegram bot!
          </li>
        </ul>
      {:else}{/if}
      {#each messages as message (message)}
        <li class="b3-list-item b3-list-item--hide-action">
          <input
            type="checkbox"
            class="inbox__checkbox"
            on:change={(event) => handleCheckboxChange(message, event)}
            checked={checkedMessages.has(message)}
          />
          {message.text}
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  .inbox__checkbox {
    margin: 0px 6px 0px 0;
  }
 
</style>

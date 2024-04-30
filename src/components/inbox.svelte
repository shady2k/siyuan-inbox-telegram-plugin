<script>
  import { messagesStore } from '../libs/store';
  export let refresh;
  let messages = [];
  let checkedMessages = new Set();

  messagesStore.subscribe(value => {
    messages = value;
  });

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
    messages = messages.filter(message => !checkedMessages.has(message));
    checkedMessages.clear(); // Clear the set after deletion
    messagesStore.set(messages); // Update the store with the new messages array
  }
</script>

<h1>Inbox</h1>
<div>
  <button on:click={refresh}>Refresh</button>
  <button on:click={deleteCheckedMessages}>Delete Checked</button>
</div>

<ul>
  {#each messages as message (message)}
    <li>
      <input type="checkbox" on:change={(event) => handleCheckboxChange(message, event)} />
      {message}
    </li>
  {/each}
</ul>
<script>
	let { array, title } = $props();

	let numMatches = $derived([array[0].length, array[1].length]);
	let numRows = $derived([array[0][0].length, array[1][0].length]);
</script>

<h2>{title}</h2>
<div class="twocol">
	{#each { length: 2 }, l}
		<div>
			リーグ{l + 1}
			<table>
				<thead>
					<tr>
						<th></th>
						{#each { length: numMatches[l] }, n}
							<th> {n + 1} </th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each { length: numRows[l] }, rk}
						<tr>
							<td> {rk + 1}位 </td>
							{#each { length: numMatches[l] }, n}
								<td> {array[l][n][rk] >= 0 ? array[l][n][rk] : '-'} </td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/each}
</div>

<style>
	table {
		border-collapse: collapse;
		border: 1px solid red;
	}
	thead {
		border-bottom: 1px solid black;
	}
	tr th:first-child,
	tr td:first-child {
		border-right: 1px solid black;
	}

	.twocol {
		display: grid;
		grid-template-columns: 1fr 1fr;
		justify-items: center;
	}
</style>

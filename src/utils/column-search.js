const scopedSlots = {
  filterDropdown: 'filterDropdown',
  filterIcon: 'filterIcon',
  customRender: 'customRender',
}
export function onFilterDropdownVisibleChange(visible){
  if (visible) {
    setTimeout(() => {
      this.searchInput.focus();
    }, 0);
  }
}
export function onFilter(value, record) {
  let arr = this.searchedColumn.split('.')
  let result = ''
  switch (arr.length){
    case 2: result = record[arr[0]][arr[1]];break
    case 3: result = record[arr[0]][arr[1]][arr[2]];break
    default: result = record[this.searchedColumn]
  }
  return result
    .toString()
    .toLowerCase()
    .includes(value.toLowerCase())
}
export function getScopedSlots() {
  return scopedSlots
}

export function handleSearch(selectedKeys, confirm, dataIndex) {
  confirm();
  this.searchText = selectedKeys[0];
  this.searchedColumn = dataIndex;
}
export function handleReset(clearFilters) {
  clearFilters();
  this.searchText = '';
}


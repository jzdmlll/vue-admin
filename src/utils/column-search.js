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
  return record[this.searchedColumn]
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


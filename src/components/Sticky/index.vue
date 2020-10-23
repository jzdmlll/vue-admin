<template>
  <div :style="{height:height+'px',zIndex:zIndex}">
    <div
      :class="className"
      :style="{top:(isSticky ? stickyTop +'px' : ''),zIndex:zIndex,position:position,width:widthData,height: height,
      background: backgroundData,margin: marginData, boxShadow: boxShadowData, padding: paddingData, right: rightData,
      opacity: '1'}"
    >
      <slot>
        <div>sticky</div>
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Sticky',
  props: {
    stickyTop: {
      type: Number,
      default: 0
    },
    zIndex: {
      type: Number,
      default: 1
    },
    className: {
      type: String,
      default: ''
    },
    boxShadow: {
      type: String,
      default: ''
    },
    background: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: 'auto'
    },
    margin: {
      type: String,
      default: ''
    },
    padding: {
      type: String,
      default: ''
    },
    right: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      active: false,
      position: '',
      height: undefined,
      marginLeft: '',
      isSticky: false,
      boxShadowData: '',
      backgroundData: '',
      widthData: '',
      marginData: '',
      paddingData: '',
      rightData: '',
    }
  },
  mounted() {
    this.height = this.$el.getBoundingClientRect().height
    window.addEventListener('scroll', this.handleScroll)
    window.addEventListener('resize', this.handleResize)
  },
  activated() {
    this.handleScroll()
  },
  destroyed() {
    window.removeEventListener('scroll', this.handleScroll)
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    sticky() {
      if (this.active) {
        return
      }
      this.position = 'fixed'
      this.active = true
      this.widthData = this.width
      this.isSticky = true
      this.boxShadowData = this.boxShadow
      this.backgroundData = this.background
      this.paddingData = this.padding
      this.rightData = this.right
      this.height = '99px'
      this.marginData = this.margin
    },
    handleReset() {
      if (!this.active) {
        return
      }
      this.reset()
    },
    reset() {
      this.position = ''
      this.widthData = 'auto'
      this.active = false
      this.isSticky = false
      this.boxShadowData = ''
      this.backgroundData = ''
      this.rightData = ''
      this.paddingData = ''
      this.height = '74px'
      this.marginData = ''
    },
    handleScroll() {
      const width = this.$el.getBoundingClientRect().width
      this.widthData = width || 'auto'
      const offsetTop = this.$el.getBoundingClientRect().top
      if (offsetTop < this.stickyTop) {
        this.sticky()
        return
      }
      this.handleReset()
    },
    handleResize() {
      if (this.isSticky) {
        this.widthData = this.$el.getBoundingClientRect().width + 'px'
      }
    }
  }
}
</script>

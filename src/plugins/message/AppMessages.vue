<template>
  <v-snackbar
    v-model="visible"
    :color="color"
    :timeout="3500"
    top
    right
    multi-line
    max-width="420"
    style="z-index: 9999;"
  >
    <div class="d-flex align-center" style="gap: 8px;">
      <span style="font-size: 16px;">{{ icon }}</span>
      <span style="font-size: 13px; font-weight: 500;">{{ text }}</span>
    </div>
    <template #action="{ attrs }">
      <v-btn icon x-small v-bind="attrs" @click="visible = false">
        <span style="font-size: 14px;">✕</span>
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
export default {
  data: () => ({
    visible: false,
    text: '',
    color: 'success',
    icon: '✓',
  }),
  methods: {
    show(type, text) {
      const map = {
        success: { color: '#22c55e', icon: '✓' },
        error:   { color: '#ef4444', icon: '✕' },
        warning: { color: '#f59e0b', icon: '⚠' },
        info:    { color: '#3b82f6', icon: 'ℹ' },
      };
      this.text = text;
      this.color = map[type]?.color || '#6366f1';
      this.icon = map[type]?.icon || 'ℹ';
      this.visible = true;
    },
  },
};
</script>

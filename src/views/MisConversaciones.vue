<template>
  <div class="ide-page">

    <!-- Header: estado + métricas personales -->
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
      <div>
        <div class="section-title">Mis Conversaciones</div>
        <p class="section-subtitle" style="margin-bottom:0;">Panel de seguimiento de tus conversaciones asignadas</p>
      </div>
      <div class="mc-estado-selector">
        <button
          v-for="op in estados"
          :key="op.valor"
          class="mc-estado-btn"
          :class="{ 'mc-estado-btn--activo': miEstado === op.valor }"
          :style="miEstado === op.valor ? { background: op.color + '22', color: op.color, borderColor: op.color + '66' } : {}"
          @click="cambiarEstado(op.valor)"
        >
          ● {{ op.label }}
        </button>
      </div>
    </div>

    <!-- Métricas personales -->
    <div class="mc-metrics">
      <div class="ide-ia-card mc-metric"><div class="mc-metric__v">{{ perfil.activas || 0 }}</div><div class="mc-metric__l">Activas</div></div>
      <div class="ide-ia-card mc-metric"><div class="mc-metric__v" style="color:#22c55e;">{{ perfil.resueltas || 0 }}</div><div class="mc-metric__l">Resueltas</div></div>
      <div class="ide-ia-card mc-metric"><div class="mc-metric__v" style="color:#f59e0b;">{{ perfil.asignadasHoy || 0 }}</div><div class="mc-metric__l">Hoy</div></div>
      <div class="ide-ia-card mc-metric"><div class="mc-metric__v" style="color:#818cf8;">{{ perfil.tiempoPromedioMinutos || 0 }}m</div><div class="mc-metric__l">T. promedio</div></div>
      <div class="ide-ia-card mc-metric"><div class="mc-metric__v">{{ perfil.tasaResolucion || 0 }}%</div><div class="mc-metric__l">Resolución</div></div>
    </div>

    <div class="mc-layout">

      <!-- Columna izquierda: listas -->
      <div class="mc-left">
        <!-- Mis asignadas -->
        <div class="ide-ia-card" style="padding:14px;">
          <div class="mc-list-title">Asignadas a mí ({{ conversaciones.length }})</div>
          <div v-if="loading" style="display:flex; justify-content:center; padding:20px;"><div class="mc-spinner"></div></div>
          <div v-else-if="conversaciones.length === 0" style="text-align:center; padding:20px; color:#475569; font-size:12px;">
            No tienes conversaciones asignadas
          </div>
          <div v-else class="mc-conv-list">
            <div
              v-for="conv in conversaciones"
              :key="conv.id"
              class="mc-conv-item"
              :class="{ 'mc-conv-item--activa': seleccionada && seleccionada.id === conv.id }"
              @click="seleccionar(conv)"
            >
              <div style="flex:1; min-width:0;">
                <div class="mc-conv-nombre">{{ conv.contacto }}</div>
                <div class="mc-conv-meta">
                  {{ conv.canal }} · {{ conv.totalMensajes }} msgs
                  <span v-if="conv.escalado" style="color:#ef4444;"> · escalada</span>
                </div>
              </div>
              <span class="mc-conv-badge" :style="badgeEstado(conv.estadoConversacion)">{{ conv.estadoConversacion }}</span>
            </div>
          </div>
        </div>

        <!-- Cola disponible -->
        <div class="ide-ia-card" style="padding:14px; margin-top:12px;">
          <div class="mc-list-title">Cola disponible ({{ cola.length }})</div>
          <div v-if="cola.length === 0" style="text-align:center; padding:14px; color:#475569; font-size:12px;">
            Sin conversaciones en espera
          </div>
          <div v-else class="mc-conv-list">
            <div v-for="conv in cola" :key="conv.id" class="mc-conv-item">
              <div style="flex:1; min-width:0;">
                <div class="mc-conv-nombre">{{ conv.contacto }}</div>
                <div class="mc-conv-meta">{{ conv.canal }} · {{ conv.totalMensajes }} msgs</div>
              </div>
              <button class="mc-tomar-btn" @click.stop="tomar(conv)">Tomar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna derecha: chat -->
      <div class="mc-right ide-ia-card">
        <div v-if="!seleccionada" class="mc-chat-empty">
          <div style="font-size:40px; margin-bottom:12px;">💬</div>
          <div style="color:#64748b; font-size:13px;">Selecciona una conversación para atenderla</div>
        </div>

        <template v-else>
          <!-- Chat header -->
          <div class="mc-chat-hd">
            <div style="flex:1; min-width:0;">
              <div style="font-size:13px; font-weight:700; color:#e2e8f0;">{{ seleccionada.contacto }}</div>
              <div style="font-size:10px; color:#64748b;">{{ seleccionada.canal }} · score {{ seleccionada.score }}</div>
            </div>
            <button class="mc-accion-btn mc-accion-btn--ia" @click="devolverAIa" title="La IA retoma la conversación">🤖 Devolver a IA</button>
            <button class="mc-accion-btn mc-accion-btn--ok" @click="marcarResuelta">✓ Resuelta</button>
          </div>

          <!-- Mensajes -->
          <div ref="mensajes" class="mc-chat-body">
            <div
              v-for="(msg, i) in seleccionada.mensajes"
              :key="i"
              class="mc-msg"
              :class="msg.role === 'user' ? 'mc-msg--user' : 'mc-msg--agente'"
            >
              <div class="mc-msg-burbuja" :class="msg.role === 'user' ? 'mc-msg-burbuja--user' : 'mc-msg-burbuja--agente'">
                {{ msg.content }}
              </div>
              <div class="mc-msg-hora">{{ formatoHora(msg.timestamp) }}</div>
            </div>
          </div>

          <!-- Input -->
          <div class="mc-chat-input">
            <input
              v-model="respuesta"
              class="ide-input"
              placeholder="Escribe tu respuesta…"
              style="flex:1;"
              @keyup.enter="enviar"
            />
            <button class="mc-enviar-btn" :disabled="!respuesta.trim() || enviando" @click="enviar">
              <span v-if="enviando" class="mc-spinner mc-spinner--sm"></span>
              <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </template>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'MisConversaciones',
  data: () => ({
    perfil: {},
    conversaciones: [],
    cola: [],
    seleccionada: null,
    respuesta: '',
    loading: true,
    enviando: false,
    miEstado: 'disponible',
    estados: [
      { valor: 'disponible', label: 'Disponible', color: '#22c55e' },
      { valor: 'ocupado',    label: 'Ocupado',    color: '#f59e0b' },
      { valor: 'ausente',    label: 'Ausente',    color: '#ef4444' },
    ],
    pollTimer: null,
  }),
  async mounted() {
    await this.cargar();
    this.pollTimer = setInterval(() => this.refrescarSilencioso(), 30000);
  },
  beforeDestroy() {
    clearInterval(this.pollTimer);
  },
  methods: {
    async cargar() {
      try {
        this.loading = true;
        const [perfil, conversaciones, cola] = await Promise.all([
          this.$service.get('agentes-humanos/mi-perfil'),
          this.$service.list('agentes-humanos/mis-conversaciones'),
          this.$service.list('agentes-humanos/cola'),
        ]);
        this.perfil = perfil || {};
        this.miEstado = this.perfil.estadoDisponibilidad || 'disponible';
        this.conversaciones = conversaciones || [];
        this.cola = cola || [];
      } finally {
        this.loading = false;
      }
    },
    async refrescarSilencioso() {
      try {
        const [conversaciones, cola] = await Promise.all([
          this.$service.list('agentes-humanos/mis-conversaciones'),
          this.$service.list('agentes-humanos/cola'),
        ]);
        this.conversaciones = conversaciones || [];
        this.cola = cola || [];
        if (this.seleccionada) {
          const actual = this.conversaciones.find(c => c.id === this.seleccionada.id);
          if (actual) { this.seleccionada = actual; this.scrollAbajo(); }
        }
      } catch (e) { /* refresco en segundo plano */ }
    },
    async cambiarEstado(estado) {
      await this.$service.patch('agentes-humanos/mi-disponibilidad', { estado });
      this.miEstado = estado;
      this.$message.success(`Ahora estás ${estado}`);
    },
    seleccionar(conv) {
      this.seleccionada = conv;
      this.scrollAbajo();
    },
    scrollAbajo() {
      this.$nextTick(() => {
        const el = this.$refs.mensajes;
        if (el) el.scrollTop = el.scrollHeight;
      });
    },
    async enviar() {
      const contenido = this.respuesta.trim();
      if (!contenido || !this.seleccionada) return;
      this.enviando = true;
      try {
        const actualizada = await this.$service.post(
          `conversaciones/${this.seleccionada.id}/mensajes`,
          { role: 'assistant', content: contenido },
        );
        this.respuesta = '';
        if (actualizada) this.seleccionada = actualizada;
        this.scrollAbajo();
      } finally {
        this.enviando = false;
      }
    },
    async marcarResuelta() {
      this.$confirm('¿Marcar esta conversación como resuelta?', async () => {
        await this.$service.post(`agentes-humanos/conversaciones/${this.seleccionada.id}/cerrar`, {});
        this.$message.success('Conversación resuelta');
        this.seleccionada = null;
        await this.cargar();
      });
    },
    async devolverAIa() {
      this.$confirm('¿Devolver esta conversación al agente IA?', async () => {
        await this.$service.post(`agentes-humanos/conversaciones/${this.seleccionada.id}/devolver-ia`, {});
        this.$message.success('Conversación devuelta a la IA');
        this.seleccionada = null;
        await this.cargar();
      });
    },
    async tomar(conv) {
      await this.$service.post('agentes-humanos/asignar', {
        conversacionId: conv.id,
        agenteHumanoId: 'self', // el backend usa el agente del usuario autenticado
        razon: 'Tomada desde la cola por el agente',
        esEscalada: !!conv.escalado,
      });
      this.$message.success('Conversación tomada');
      await this.cargar();
    },
    badgeEstado(estado) {
      const map = {
        abierto:   { background: '#6366f122', color: '#818cf8' },
        pendiente: { background: '#f59e0b22', color: '#f59e0b' },
        resuelto:  { background: '#22c55e22', color: '#22c55e' },
        cerrado:   { background: '#47556922', color: '#64748b' },
      };
      return map[estado] || map.abierto;
    },
    formatoHora(ts) {
      if (!ts) return '';
      try {
        return new Date(ts).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
      } catch { return ''; }
    },
  },
};
</script>

<style scoped>
.mc-estado-selector { display: flex; gap: 6px; }
.mc-estado-btn {
  background: transparent; border: 1px solid #334155; color: #64748b;
  border-radius: 999px; padding: 6px 14px; font-size: 11px; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.mc-estado-btn--activo { font-weight: 800; }

.mc-metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 10px; margin-bottom: 16px; }
.mc-metric { padding: 12px; text-align: center; }
.mc-metric__v { font-size: 19px; font-weight: 800; color: #e2e8f0; }
.mc-metric__l { font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }

.mc-layout { display: grid; grid-template-columns: 320px 1fr; gap: 14px; align-items: start; }
@media (max-width: 900px) { .mc-layout { grid-template-columns: 1fr; } }

.mc-list-title { font-size: 11px; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px; }

.mc-conv-list { display: flex; flex-direction: column; gap: 6px; max-height: 320px; overflow-y: auto; }
.mc-conv-item {
  display: flex; align-items: center; gap: 8px;
  background: #0f172a; border: 1px solid transparent; border-radius: 8px;
  padding: 9px 10px; cursor: pointer; transition: border-color 0.15s;
}
.mc-conv-item:hover { border-color: #334155; }
.mc-conv-item--activa { border-color: #6366f1; }
.mc-conv-nombre { font-size: 12px; font-weight: 700; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mc-conv-meta { font-size: 10px; color: #64748b; }
.mc-conv-badge { font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 999px; flex-shrink: 0; }

.mc-tomar-btn {
  background: #6366f1; color: #fff; border: none; border-radius: 6px;
  padding: 5px 10px; font-size: 10px; font-weight: 700; cursor: pointer;
  font-family: inherit; flex-shrink: 0;
}
.mc-tomar-btn:hover { background: #4f46e5; }

.mc-right { display: flex; flex-direction: column; min-height: 480px; padding: 0; overflow: hidden; }
.mc-chat-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px; }

.mc-chat-hd {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px; border-bottom: 1px solid #1e3a5f44; flex-shrink: 0;
}
.mc-accion-btn {
  border: 1px solid #334155; background: transparent; border-radius: 7px;
  padding: 6px 10px; font-size: 10px; font-weight: 700; cursor: pointer;
  font-family: inherit; flex-shrink: 0; transition: all 0.15s;
}
.mc-accion-btn--ia { color: #818cf8; }
.mc-accion-btn--ia:hover { border-color: #6366f1; background: #6366f111; }
.mc-accion-btn--ok { color: #22c55e; }
.mc-accion-btn--ok:hover { border-color: #22c55e; background: #22c55e11; }

.mc-chat-body { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; min-height: 280px; max-height: 440px; }
.mc-msg { display: flex; flex-direction: column; max-width: 75%; }
.mc-msg--user { align-self: flex-start; }
.mc-msg--agente { align-self: flex-end; align-items: flex-end; }
.mc-msg-burbuja { padding: 8px 12px; border-radius: 12px; font-size: 12px; line-height: 1.5; }
.mc-msg-burbuja--user { background: #1e293b; color: #cbd5e1; border-bottom-left-radius: 4px; }
.mc-msg-burbuja--agente { background: #6366f1; color: #fff; border-bottom-right-radius: 4px; }
.mc-msg-hora { font-size: 9px; color: #475569; margin-top: 2px; padding: 0 4px; }

.mc-chat-input {
  display: flex; gap: 8px; padding: 12px 16px;
  border-top: 1px solid #1e3a5f44; flex-shrink: 0;
}
.mc-enviar-btn {
  background: #6366f1; color: #fff; border: none; border-radius: 8px;
  width: 38px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.15s; flex-shrink: 0;
}
.mc-enviar-btn:hover:not(:disabled) { background: #4f46e5; }
.mc-enviar-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.mc-spinner {
  width: 28px; height: 28px; border-radius: 50%;
  border: 3px solid #6366f1; border-top-color: transparent;
  animation: mc-spin 0.75s linear infinite;
}
.mc-spinner--sm { width: 13px; height: 13px; border-width: 2px; border-color: #fff; border-top-color: transparent; }
@keyframes mc-spin { to { transform: rotate(360deg); } }
</style>

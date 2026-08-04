<template>
  <!-- Standalone route: 3-column inbox layout (colapsa a 1-2 columnas en tablet/teléfono) -->
  <div v-if="!agenteId" class="cv-root">

    <!-- ══════════════════════════════════════
         COLUMN 1 — Conversation List (320px)
    ══════════════════════════════════════ -->
    <div class="cv-col-left" :class="{ 'cv-col-left--oculta-movil': seleccionada }">

      <!-- Header -->
      <div class="cv-left-header">
        <div class="cv-left-header-top">
          <div class="cv-left-title-group">
            <span class="cv-left-title">Conversaciones</span>
            <span v-if="conversaciones.length" class="cv-count-badge">{{ conversaciones.length }}</span>
          </div>
          <div class="cv-left-header-actions">
            <div v-if="pollingActivo" class="cv-pulse-dot" title="Actualizando automáticamente"></div>
            <button @click="cargar(true)" class="cv-refresh-btn" title="Actualizar">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
              </svg>
            </button>
            <button class="cv-filtros-toggle-btn" @click="filtrosExpandidos = !filtrosExpandidos" :title="filtrosExpandidos ? 'Ocultar filtros' : 'Mostrar filtros'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
            </button>
            <button class="cv-nueva-btn" @click="$router.push('/admin/nueva-conversacion').catch(()=>{})">
              + Nueva
            </button>
          </div>
        </div>

        <!-- Search -->
        <div class="cv-search-wrap">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" stroke-width="2" class="cv-search-icon">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="busqueda" class="cv-search" placeholder="Buscar conversación..." />
        </div>
      </div>

      <!-- Channel tabs -->
      <div class="cv-tabs-bar">
        <button
          v-for="tab in filtros"
          :key="tab.id"
          class="cv-tab"
          :class="{ 'cv-tab--active': filtroActivo === tab.id }"
          @click="filtroActivo = tab.id"
        >{{ tab.label }}</button>
      </div>

      <!-- Status filter pills -->
      <div class="cv-pills-bar">
        <button
          v-for="est in estadosFiltro"
          :key="est.id"
          class="cv-pill"
          :class="{ 'cv-pill--active': filtroEstado === est.id }"
          @click="filtroEstado = est.id"
        >{{ est.label }}</button>
      </div>

      <!-- Date & Score filters — colapsables en teléfono via cv-filtros-toggle-btn -->
      <div class="cv-filters-block" :class="{ 'cv-filters-block--expandido': filtrosExpandidos }" style="padding:10px 12px; border-bottom:1px solid var(--border-card); display:flex; flex-direction:column; gap:8px; flex-shrink:0;">
        <!-- Filter by days -->
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-size:10px; font-weight:700; color:var(--text-faint); flex-shrink:0;">📅 DÍAS:</span>
          <select v-model="filtroDias" class="cv-filter-select" style="flex:1;">
            <option value="">Todos</option>
            <option value="hoy">Hoy</option>
            <option value="ayer">Ayer</option>
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
          </select>
        </div>
        <!-- Filter by score -->
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-size:10px; font-weight:700; color:var(--text-faint); flex-shrink:0;">⭐ SCORE:</span>
          <select v-model="filtroScore" class="cv-filter-select" style="flex:1;">
            <option value="">Todos</option>
            <option value="hot">Hot (70+)</option>
            <option value="warm">Warm (40-69)</option>
            <option value="cold">Cold (0-39)</option>
          </select>
        </div>
      </div>

      <!-- Conversation list -->
      <div class="cv-list-scroll">
        <div v-if="loading" class="cv-center-pad">
          <div class="cv-spinner cv-spinner--28"></div>
        </div>
        <div v-else-if="conversacionesFiltradas.length === 0" class="cv-empty-list">Sin conversaciones</div>
        <div
          v-else
          v-for="conv in conversacionesFiltradas"
          :key="conv.id"
          class="cv-row"
          :class="{ 'cv-row--active': seleccionadaId === conv.id }"
          @click="seleccionar(conv)"
        >
          <!-- Social mini-row (solo para FB/IG/TikTok) -->
          <div v-if="conv.canal !== 'whatsapp' && conv.canal !== 'chat'" class="cv-social-row">
            <span class="cv-social-chip" :style="{ background: canalColor(conv.canal)+'22', color: canalColor(conv.canal) }">
              {{ canalEmoji(conv.canal) }} {{ canalLabel(conv.canal) }}
            </span>
            <span class="cv-post-chip">
              {{ conv.notas && conv.notas.toLowerCase().includes('reel') ? 'Reel' : 'Post' }}
            </span>
            <span v-if="displaySubtitulo(conv)" class="cv-social-title">{{ displaySubtitulo(conv) }}</span>
          </div>

          <!-- Avatar + contenido -->
          <div class="cv-row-inner">
            <div class="cv-avatar-wrap">
              <div class="cv-avatar" :style="{ background: canalColor(conv.canal)+'33', color: canalColor(conv.canal) }">
                {{ nombreRemitente(conv).slice(0, 2).toUpperCase() }}
              </div>
              <span v-if="conv.canal !== 'whatsapp' && conv.canal !== 'chat'" class="cv-platform-mini" :style="{ background: canalColor(conv.canal) }">
                {{ canalEmoji(conv.canal) }}
              </span>
              <span v-else class="cv-online-dot"></span>
            </div>

            <div class="cv-row-body">
              <!-- Nombre del contacto + hora -->
              <div class="cv-row-top">
                <span class="cv-row-name">{{ nombreRemitente(conv) }}</span>
                <span class="cv-row-time">{{ formatTime(conv.fechaCreacion) }}</span>
              </div>

              <!-- Vista previa del mensaje -->
              <p class="cv-row-preview">{{ displayMensajePreview(conv) }}</p>

              <!-- Etiquetas + badge no leídos -->
              <div class="cv-row-tags-line">
                <div class="cv-row-tags">
                  <span
                    v-for="tag in etiquetasConv(conv)"
                    :key="tag.label"
                    class="cv-tag"
                    :style="{ background: tag.color+'18', color: tag.color, border: '1px solid '+tag.color+'33' }"
                  >{{ tag.label }}</span>
                </div>
                <span v-if="unreadCount(conv) > 0" class="cv-unread-badge">{{ unreadCount(conv) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div><!-- /cv-col-left -->


    <!-- ══════════════════════════════════════
         COLUMN 2 — Chat / Messages (flex:1)
    ══════════════════════════════════════ -->
    <div class="cv-col-mid" :class="{ 'cv-col-mid--activa-movil': seleccionada }">
      <template v-if="seleccionada">

        <!-- ── Chat Header ── -->
        <div class="cv-chat-header">
          <div class="cv-chat-header-left">
            <!-- Volver a la lista (solo teléfono) -->
            <button class="cv-back-btn" @click="volverALista" title="Volver a conversaciones">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <!-- Avatar with platform badge -->
            <div class="cv-chat-avatar-wrap">
              <div class="cv-avatar-md" :style="{ background: canalColor(seleccionada.canal)+'33', color: canalColor(seleccionada.canal) }">
                {{ nombreRemitente(seleccionada).slice(0, 2).toUpperCase() }}
              </div>
              <span class="cv-platform-badge" :style="{ background: canalColor(seleccionada.canal) }">
                {{ canalEmoji(seleccionada.canal) }}
              </span>
            </div>
            <div>
              <div class="cv-chat-name">{{ nombreRemitente(seleccionada) }}</div>
              <div class="cv-chat-meta">
                <span class="cv-chat-meta-icon" :style="{ color: canalColor(seleccionada.canal) }">{{ canalEmoji(seleccionada.canal) }}</span>
                <span class="cv-chat-handle">{{ chatHandle(seleccionada) }}</span>
                <span class="cv-chat-sep">·</span>
                <span class="cv-status-dot" :style="{ color: seleccionada.estadoConversacion === 'resuelto' ? '#22c55e' : seleccionada.estadoConversacion === 'pendiente' ? '#f59e0b' : '#3b82f6' }">●</span>
                <span class="cv-chat-estado" :style="{ color: seleccionada.estadoConversacion === 'resuelto' ? '#22c55e' : seleccionada.estadoConversacion === 'pendiente' ? '#f59e0b' : 'var(--text-muted)' }">
                  {{ seleccionada.estadoConversacion ? seleccionada.estadoConversacion.charAt(0).toUpperCase() + seleccionada.estadoConversacion.slice(1) : 'Abierto' }}
                </span>
              </div>
            </div>
          </div>

          <div class="cv-chat-header-right">
            <div v-if="cargandoMensajes" class="cv-spinner cv-spinner--16"></div>
            <!-- Score badge -->
            <span class="cv-score-badge" :style="{ color: scoreColor(seleccionada.score) }">
              ⭐ {{ seleccionada.score }}
            </span>
            <button class="cv-detalle-btn cv-detalle-btn--toggle" @click="panelDetalleAbierto = true">Detalle</button>
            <button
              class="cv-detalle-btn"
              style="color:#22c55e; border-color:#22c55e44;"
              title="Crear oportunidad de venta con este contacto"
              :disabled="creandoOportunidad"
              @click="crearOportunidad"
            >
              🎯 {{ creandoOportunidad ? 'Creando…' : 'Oportunidad' }}
            </button>
            <button
              class="cv-detalle-btn"
              style="color:#f59e0b; border-color:#f59e0b44;"
              title="Crear caso de soporte desde esta conversación"
              :disabled="creandoCaso"
              @click="crearCasoSoporte"
            >
              🎧 {{ creandoCaso ? 'Creando…' : 'Caso' }}
            </button>
            <button
              v-if="seleccionada.estadoConversacion !== 'resuelto'"
              class="cv-resolver-btn"
              @click="cambiarEstado('resuelto')"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Resolver
            </button>
            <div v-else class="cv-resolver-btn cv-resolver-btn--done">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Resuelto
            </div>
            <button
              class="cv-detalle-btn"
              style="color:#ef4444; border-color:#ef444444;"
              title="Eliminar conversación"
              :disabled="eliminandoConversacion"
              @click="eliminarConversacion(seleccionada)"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/>
              </svg>
              {{ eliminandoConversacion ? 'Eliminando…' : 'Eliminar' }}
            </button>
          </div>
        </div>

        <!-- ── Messages area ── -->
        <div ref="msgContainer" class="cv-messages-area">
          <div v-if="!seleccionada.mensajes || !seleccionada.mensajes.length" class="cv-no-msgs">
            Sin mensajes registrados
          </div>
          <template v-else>
            <!-- System pill: origin from post -->
            <div v-if="seleccionada.notas && seleccionada.notas.startsWith('Post:')" class="cv-system-pill">
              💬 Inició conversación desde Post: "{{ seleccionada.notas.replace('Post:', '').trim() }}"
            </div>

            <!-- Messages — USER: LEFT | AGENT: RIGHT -->
            <div
              v-for="(msg, i) in seleccionada.mensajes"
              :key="i"
              class="cv-msg-row"
              :class="msg.role === 'user' ? 'cv-msg-row--user' : 'cv-msg-row--agent'"
            >
              <!-- User message: avatar LEFT, bubble right of avatar -->
              <template v-if="msg.role === 'user'">
                <div class="cv-avatar-sm cv-avatar-user" :style="{ background: canalColor(seleccionada.canal)+'33', color: canalColor(seleccionada.canal) }">
                  {{ nombreRemitente(seleccionada).slice(0, 2).toUpperCase() }}
                </div>
                <div class="cv-msg-content">
                  <div v-if="msg.adjunto" class="cv-adjunto">
                    <img v-if="msg.adjunto.tipo === 'image'" :src="msg.adjunto.url" class="cv-adjunto-img" @click="abrirAdjunto(msg.adjunto.url)" />
                    <audio v-else-if="msg.adjunto.tipo === 'audio'" :src="msg.adjunto.url" controls class="cv-adjunto-audio"></audio>
                    <a v-else :href="msg.adjunto.url" target="_blank" rel="noopener" class="cv-adjunto-doc">
                      📄 {{ msg.adjunto.nombre || 'Documento' }}
                    </a>
                  </div>
                  <a v-if="msg.ubicacion" :href="linkMapa(msg.ubicacion)" target="_blank" rel="noopener" class="cv-adjunto-doc">
                    📍 {{ msg.ubicacion.nombre || 'Ver ubicación compartida' }}
                  </a>
                  <div v-if="msg.content && !esPlaceholderAdjunto(msg)" class="cv-bubble cv-bubble--user">{{ limpiarContenido(msg.content) }}</div>
                  <div class="cv-msg-meta cv-msg-meta--left">
                    <span>{{ nombreRemitente(seleccionada) }}</span>
                    <span v-if="msg.timestamp" class="cv-msg-time">· {{ formatTime(msg.timestamp) }}</span>
                  </div>
                </div>
              </template>

              <!-- Agent message: bubble LEFT, avatar RIGHT -->
              <template v-else>
                <div class="cv-msg-content cv-msg-content--agent">
                  <div v-if="msg.adjunto" class="cv-adjunto">
                    <img v-if="msg.adjunto.tipo === 'image'" :src="msg.adjunto.url" class="cv-adjunto-img" @click="abrirAdjunto(msg.adjunto.url)" />
                    <audio v-else-if="msg.adjunto.tipo === 'audio'" :src="msg.adjunto.url" controls class="cv-adjunto-audio"></audio>
                    <a v-else :href="msg.adjunto.url" target="_blank" rel="noopener" class="cv-adjunto-doc">
                      📄 {{ msg.adjunto.nombre || 'Documento' }}
                    </a>
                  </div>
                  <div v-if="msg.content && !esPlaceholderAdjunto(msg)" class="cv-bubble cv-bubble--ai">{{ msg.content }}</div>
                  <div v-if="msg.interactivo" class="cv-opciones-chips">
                    <span v-for="boton in msg.interactivo.botones" :key="boton.id" class="cv-opciones-chip">{{ boton.titulo }}</span>
                  </div>
                  <div v-if="msg.enlace" class="cv-opciones-chips">
                    <a :href="msg.enlace.url" target="_blank" rel="noopener" class="cv-opciones-chip cv-enlace-chip">🔗 {{ msg.enlace.texto }}</a>
                  </div>
                  <div v-if="msg.pidioUbicacion" class="cv-opciones-chips">
                    <span class="cv-opciones-chip">📍 Se solicitó la ubicación</span>
                  </div>
                  <div class="cv-msg-meta cv-msg-meta--right">
                    <span>Agente IA</span>
                    <span v-if="msg.timestamp" class="cv-msg-time">· {{ formatTime(msg.timestamp) }}</span>
                  </div>
                </div>
                <div class="cv-avatar-sm cv-avatar-agent">✦</div>
              </template>
            </div>

            <!-- Typing indicator -->
            <div v-if="enviando" class="cv-msg-row cv-msg-row--agent">
              <div class="cv-msg-content cv-msg-content--agent">
                <div class="cv-bubble cv-bubble--ai cv-typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
              <div class="cv-avatar-sm cv-avatar-agent">✦</div>
            </div>
          </template>
        </div>

        <!-- ── Reply input area ── -->
        <div class="cv-input-area">
          <div v-if="errorEnvio" class="cv-error-bar">{{ errorEnvio }}</div>

          <!-- Previsualización del archivo elegido, antes de enviar -->
          <div v-if="archivoSeleccionado" class="cv-adjunto-preview">
            <img v-if="previsualizacionUrl" :src="previsualizacionUrl" class="cv-adjunto-preview-img" />
            <span v-else class="cv-adjunto-preview-doc">📄 {{ archivoSeleccionado.name }}</span>
            <button class="cv-adjunto-preview-quitar" @click="cancelarArchivo" title="Quitar">✕</button>
          </div>

          <input ref="inputArchivo" type="file" style="display:none" @change="onArchivoElegido" />
          <input ref="inputImagen" type="file" accept="image/*" style="display:none" @change="onArchivoElegido" />

          <div class="cv-input-box" :class="{ 'cv-input-box--focus': inputFocus }">
            <button class="cv-icon-action-btn" title="Adjuntar archivo" :disabled="subiendoArchivo" @click="$refs.inputArchivo.click()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
              </svg>
            </button>
            <button class="cv-icon-action-btn" title="Imagen" :disabled="subiendoArchivo" @click="$refs.inputImagen.click()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </button>
            <div class="cv-emoji-wrap">
              <button class="cv-icon-action-btn" title="Emoji" @click="mostrarEmojiPicker = !mostrarEmojiPicker">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9" stroke-linecap="round" stroke-width="2.5"/>
                  <line x1="15" y1="9" x2="15.01" y2="9" stroke-linecap="round" stroke-width="2.5"/>
                </svg>
              </button>
              <div v-if="mostrarEmojiPicker" class="cv-emoji-popover">
                <Picker :data="emojiIndex" set="google" title="Emojis" :native="true" @select="onEmojiSeleccionado" />
              </div>
            </div>
            <textarea
              v-model="respuesta"
              @keydown.enter.exact.prevent="enviarRespuesta"
              @focus="inputFocus = true"
              @blur="inputFocus = false"
              class="cv-reply-input"
              :placeholder="archivoSeleccionado ? 'Agregar un comentario (opcional)...' : 'Escribe un mensaje...'"
              rows="1"
              :disabled="enviando"
            ></textarea>
            <button @click="enviarRespuesta" class="cv-send-btn" :disabled="(!respuesta.trim() && !archivoSeleccionado) || enviando || subiendoArchivo">
              <svg v-if="!enviando && !subiendoArchivo" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              <div v-else class="cv-spinner cv-spinner--14 cv-spinner--white"></div>
              <span v-if="!enviando && !subiendoArchivo" class="cv-send-label">Enviar</span>
            </button>
          </div>
          <div v-if="seleccionada.canal === 'whatsapp'" class="cv-wa-hint">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Enviará por WhatsApp al número {{ seleccionada.contacto }}
          </div>
        </div>
      </template>

      <!-- No conversation selected -->
      <div v-else class="cv-no-selection">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--border)" stroke-width="1.5">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
        <span>Selecciona una conversación</span>
      </div>
    </div><!-- /cv-col-mid -->


    <!-- Backdrop del panel de detalle en tablet/teléfono -->
    <div v-if="seleccionada && panelDetalleAbierto" class="cv-detalle-backdrop" @click="panelDetalleAbierto = false"></div>

    <!-- ══════════════════════════════════════
         COLUMN 3 — Right detail panel (280px, drawer en tablet/teléfono)
    ══════════════════════════════════════ -->
    <div v-if="seleccionada" class="cv-col-right" :class="{ 'cv-col-right--abierto-movil': panelDetalleAbierto }">
      <button class="cv-detalle-close-btn" @click="panelDetalleAbierto = false" title="Cerrar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <!-- ORIGEN DE LA CONVERSACIÓN -->
      <div v-if="seleccionada.notas && seleccionada.notas.startsWith('Post:')" class="cv-panel-section">
        <div class="cv-panel-label">ORIGEN DE LA CONVERSACIÓN</div>
        <div class="cv-origen-body">

          <!-- Fila superior: canal izquierda, tipo derecha -->
          <div class="cv-origen-header">
            <span class="cv-origen-platform-chip" :style="{ background: canalColor(seleccionada.canal)+'22', color: canalColor(seleccionada.canal), border: '1px solid '+canalColor(seleccionada.canal)+'44' }">
              {{ canalEmoji(seleccionada.canal) }} {{ canalLabel(seleccionada.canal) }}
            </span>
            <span class="cv-origen-type-chip">
              {{ (postRelacionado && postRelacionado.tipo) === 'video' ? 'Reel' : 'Post' }}
            </span>
          </div>

          <!-- Thumbnail del post -->
          <div class="cv-post-thumb">
            <img v-if="postRelacionado && postRelacionado.imageUrl" :src="postRelacionado.imageUrl" class="cv-post-thumb-img" />
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--border)" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>

          <!-- Título del post -->
          <p class="cv-post-text">{{ seleccionada.notas.replace('Post:', '').trim() }}</p>

          <!-- Métricas reales -->
          <div class="cv-post-metrics">
            <span>❤ {{ postRelacionado ? postRelacionado.likes : '—' }}</span>
            <span>💬 {{ postRelacionado ? postRelacionado.comentarios : '—' }}</span>
            <span>↗ {{ postRelacionado ? postRelacionado.compartidos : '—' }}</span>
          </div>

          <a href="#" class="cv-ver-post-link" @click.prevent>Ver publicación ↗</a>
        </div>
      </div>

      <!-- CONTACTO -->
      <div class="cv-panel-section">
        <div class="cv-panel-label">CONTACTO</div>
        <div class="cv-panel-rows">
          <div class="cv-panel-row" style="flex-wrap:wrap;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" stroke-width="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <div style="flex:1; display:flex; gap:8px; align-items:center;">
              <span v-if="!editandoNombre" style="flex:1;">{{ nombreRemitente(seleccionada) }}</span>
              <input v-else v-model="nuevoNombre" class="ide-input" style="flex:1; font-size:12px; padding:4px 8px;" @keydown.enter="guardarNombreYCerrar" @keydown.escape="cancelarEdicion" autofocus />
              <button @click="editandoNombre ? guardarNombreYCerrar() : abrirEdicionNombre()" style="background:none; border:none; cursor:pointer; color:var(--text-faint); padding:4px; font-size:11px;">
                {{ editandoNombre ? '✓' : '✏️' }}
              </button>
            </div>
          </div>
          <div v-if="!seleccionada.contacto || (!seleccionada.contacto.startsWith('fb_cm_') && !seleccionada.contacto.startsWith('fb_comment_'))" class="cv-panel-row">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" stroke-width="2">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
            </svg>
            <span>{{ chatHandle(seleccionada) }}</span>
          </div>
          <div class="cv-panel-row">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>Última actividad: {{ ultimaActividad(seleccionada) }}</span>
          </div>
        </div>
      </div>

      <!-- PUNTUACIÓN -->
      <div class="cv-panel-section">
        <div class="cv-panel-label">PUNTUACIÓN</div>
        <div class="cv-score-row">
          <div class="cv-score-track">
            <div
              class="cv-score-fill"
              :style="{ width: seleccionada.score+'%', background: scoreColor(seleccionada.score) }"
            ></div>
          </div>
          <span class="cv-score-num" :style="{ color: scoreColor(seleccionada.score) }">{{ seleccionada.score }}</span>
        </div>
      </div>

      <!-- PIPELINE -->
      <div class="cv-panel-section">
        <div class="cv-panel-label">PIPELINE</div>
        <div class="cv-pipeline-chips">
          <button
            v-for="etapa in pipelineCRM"
            :key="etapa.valor"
            class="cv-pipeline-chip"
            :class="{ 'cv-pipeline-chip--active': seleccionada.estadoConversacion === etapa.valor }"
            :style="seleccionada.estadoConversacion === etapa.valor
              ? { background: '#3b82f622', color: '#60a5fa', border: '1px solid #3b82f655' }
              : { background: 'transparent', color: 'var(--text-faint)', border: '1px solid var(--border-card)' }"
            @click="cambiarEstado(etapa.valor)"
          >{{ etapa.label }}</button>
        </div>
      </div>

      <!-- ETIQUETAS -->
      <div class="cv-panel-section">
        <div class="cv-panel-label">ETIQUETAS</div>
        <div class="cv-tags-row">
          <span
            v-for="tag in (seleccionada.etiquetas || [])"
            :key="tag"
            class="cv-tag"
            style="background:#6366f122; color:#818cf8; border:1px solid #6366f155; display:flex; align-items:center; gap:6px; padding:4px 8px;"
          >
            {{ tag }}
            <button @click="eliminarEtiqueta(tag)" style="background:none; border:none; cursor:pointer; color:#818cf8; font-size:14px; padding:0; line-height:1;">×</button>
          </span>
          <button class="cv-add-tag-btn" @click="dialogNuevaEtiqueta = true">+ Añadir</button>
        </div>
      </div>

      <!-- AGENTE ASIGNADO -->
      <div class="cv-panel-section">
        <div class="cv-panel-label">AGENTE ASIGNADO</div>
        <div class="cv-agente-wrap">
          <div v-if="agenteAsignadoIA" class="cv-agente-avatar" :style="{ background: '#6366f133', color: '#818cf8' }">
            <span v-if="guarandoAgente" style="display:flex; align-items:center; justify-content:center; width:100%; height:100%;">
              <v-progress-circular indeterminate size="20" width="2" color="#818cf8"></v-progress-circular>
            </span>
            <span v-else>{{ (agentesDisponibles.find(a => String(a.id) === String(agenteAsignadoIA)) || {}).nombre
               ? (agentesDisponibles.find(a => String(a.id) === String(agenteAsignadoIA)).nombre.slice(0,2).toUpperCase())
               : 'IA' }}</span>
          </div>
          <select v-model="agenteAsignadoIA" class="cv-select" @change="guardarAgenteAsignado(agenteAsignadoIA)" :disabled="guarandoAgente">
            <option value="">Sin asignar</option>
            <option v-for="ag in agentesDisponibles" :key="ag.id" :value="ag.id">{{ ag.nombre }}</option>
          </select>
        </div>
        <div class="cv-agente-wrap" style="margin-top:8px;">
          <select v-model="agenteAsignadoHumano" class="cv-select">
            <option value="">Sin agente humano</option>
          </select>
        </div>
      </div>

      <!-- NOTA INTERNA -->
      <div class="cv-panel-section">
        <div class="cv-panel-label">NOTA INTERNA</div>
        <textarea
          v-model="notaInterna"
          class="cv-nota-textarea"
          placeholder="Agregar nota..."
          rows="3"
        ></textarea>
        <button
          class="cv-guardar-nota-btn"
          @click="guardarNota"
          :disabled="!notaInterna.trim()"
        >Guardar nota</button>
      </div>

    </div><!-- /cv-col-right -->

    <!-- Modal: Nueva Etiqueta -->
    <div v-if="dialogNuevaEtiqueta" class="cv-overlay" @click.self="dialogNuevaEtiqueta = false">
      <div style="background:var(--bg-surface); border:1px solid var(--border); border-radius:12px; width:380px; max-width:95vw; padding:24px;">
        <div style="font-size:15px; font-weight:700; color:var(--text-heading); margin-bottom:16px;">Agregar etiqueta</div>
        <input
          v-model="nuevaEtiqueta"
          @keydown.enter="agregarEtiqueta"
          class="ide-input"
          placeholder="Ej: Cliente VIP, Pendiente, Urgente..."
          style="width:100%; margin-bottom:16px;"
          autofocus
        />
        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button @click="dialogNuevaEtiqueta = false" style="background:none; border:1px solid var(--border); border-radius:8px; color:var(--text-faint); padding:8px 14px; font-size:12px; cursor:pointer; font-family:inherit;">Cancelar</button>
          <button @click="agregarEtiqueta" :disabled="!nuevaEtiqueta.trim()" style="background:#6366f1; color:#fff; border:none; border-radius:8px; padding:8px 16px; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit;">Agregar</button>
        </div>
      </div>
    </div>

  </div><!-- /cv-root -->


  <!-- ══════════════════════════════════════
       EMBEDDED MODE (agenteId prop set)
       Compact conversation list
  ══════════════════════════════════════ -->
  <div v-else>
    <div v-if="loading" class="cv-center-pad">
      <div class="cv-spinner cv-spinner--28"></div>
    </div>
    <div v-else-if="conversaciones.length === 0" class="cv-compact-empty">
      <div style="font-size:32px; margin-bottom:12px;">💬</div>
      <div style="font-size:13px;">No hay conversaciones registradas</div>
    </div>
    <div v-else style="display:flex; flex-direction:column; gap:10px;">
      <div v-for="conv in conversaciones" :key="conv.id" class="cv-compact-row">
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="cv-avatar" :style="{ background: canalColor(conv.canal)+'33', color: canalColor(conv.canal) }">
            {{ conv.contacto ? conv.contacto.slice(0,2).toUpperCase() : '??' }}
          </div>
          <div style="flex:1; min-width:0;">
            <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-bottom:3px;">
              <span style="font-size:13px; font-weight:700; color:var(--text-primary);">{{ conv.contacto }}</span>
              <span class="cv-tag" :style="{ background: canalColor(conv.canal)+'22', color: canalColor(conv.canal) }">{{ conv.canal }}</span>
              <span v-if="conv.escalado" class="cv-tag" style="background:#f9731622; color:#f97316;">Escalado</span>
            </div>
            <div style="font-size:11px; color:var(--text-faint);">{{ conv.totalMensajes }} mensajes · {{ formatDate(conv.fechaCreacion) }}</div>
          </div>
          <div style="text-align:center; flex-shrink:0;">
            <div style="font-size:18px; font-weight:900;" :style="{ color: scoreColor(conv.score) }">{{ conv.score }}</div>
            <div style="font-size:9px; color:var(--text-disabled);">score</div>
          </div>
        </div>
        <div v-if="conv.resolucion" style="font-size:11px; color:var(--text-faint); margin-top:8px; padding-top:8px; border-top:1px solid var(--border-card);">{{ conv.resolucion }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { Picker, EmojiIndex } from 'emoji-mart-vue-fast';
import emojiData from 'emoji-mart-vue-fast/data/all.json';
import 'emoji-mart-vue-fast/css/emoji-mart.css';

const POLL_INTERVAL = 8000;
const emojiIndex = new EmojiIndex(emojiData);

export default {
  name: 'Conversaciones',
  components: { Picker },
  props: { agenteId: { type: String, default: null } },
  data: () => ({
    emojiIndex,
    mostrarEmojiPicker: false,
    conversaciones: [],
    loading: true,
    cargandoMensajes: false,
    creandoOportunidad: false,
    creandoCaso: false,
    eliminandoConversacion: false,
    filtroActivo: 'todas',
    filtroEstado: 'todos',
    filtroDias: '',
    filtroScore: '',
    busqueda: '',
    seleccionadaId: null,
    seleccionada: null,
    respuesta: '',
    enviando: false,
    errorEnvio: null,
    inputFocus: false,
    pollingActivo: false,
    pollTimer: null,
    notaInterna: '',
    agenteAsignadoIA: '',
    agenteAsignadoHumano: '',
    agentesDisponibles: [],
    posts: [],
    postRelacionado: null,
    guarandoAgente: false,
    dialogNuevaEtiqueta: false,
    nuevaEtiqueta: '',
    editandoNombre: false,
    nuevoNombre: '',
    filtrosExpandidos: false,
    panelDetalleAbierto: false,
    archivoSeleccionado: null,
    previsualizacionUrl: null,
    subiendoArchivo: false,
    filtros: [
      { id: 'todas',     label: 'Todos'      },
      { id: 'whatsapp',  label: 'WhatsApp'   },
      { id: 'facebook',  label: 'Facebook'   },
      { id: 'instagram', label: 'Instagram'  },
      { id: 'tiktok',    label: 'TikTok'     },
      { id: 'escaladas', label: 'Escaladas'  },
    ],
    estadosFiltro: [
      { id: 'todos',     label: 'Todos'     },
      { id: 'nuevo',     label: 'Nuevo'     },
      { id: 'abierto',   label: 'Abierto'   },
      { id: 'pendiente', label: 'Pendiente' },
      { id: 'resuelto',  label: 'Resuelto'  },
    ],
    pipelineCRM: [
      { valor: 'abierto',     label: 'Nuevo Lead'  },
      { valor: 'contactado',  label: 'Contactado'  },
      { valor: 'calificado',  label: 'Calificado'  },
      { valor: 'propuesta',   label: 'Propuesta'   },
      { valor: 'negociacion', label: 'Negociación' },
      { valor: 'ganado',      label: 'Ganado'      },
      { valor: 'perdido',     label: 'Perdido'     },
    ],
  }),
  computed: {
    conversacionesFiltradas() {
      let list = this.conversaciones;

      // Canal filter
      if (this.filtroActivo === 'escaladas') list = list.filter(c => c.escalado);
      else if (this.filtroActivo !== 'todas') list = list.filter(c => c.canal === this.filtroActivo);

      // Estado filter
      if (this.filtroEstado === 'nuevo') list = list.filter(c => !c.estadoConversacion || c.estadoConversacion === 'abierto');
      else if (this.filtroEstado !== 'todos') list = list.filter(c => c.estadoConversacion === this.filtroEstado);

      // Days filter
      if (this.filtroDias) {
        const now = new Date();
        list = list.filter(c => {
          const convDate = new Date(c.fechaCreacion);
          if (this.filtroDias === 'hoy') {
            return convDate.toDateString() === now.toDateString();
          } else if (this.filtroDias === 'ayer') {
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            return convDate.toDateString() === yesterday.toDateString();
          } else if (this.filtroDias === '7') {
            const sevenDaysAgo = new Date(now);
            sevenDaysAgo.setDate(now.getDate() - 7);
            return convDate >= sevenDaysAgo;
          } else if (this.filtroDias === '30') {
            const thirtyDaysAgo = new Date(now);
            thirtyDaysAgo.setDate(now.getDate() - 30);
            return convDate >= thirtyDaysAgo;
          }
          return true;
        });
      }

      // Score filter
      if (this.filtroScore) {
        list = list.filter(c => {
          if (this.filtroScore === 'hot') return c.score >= 70;
          if (this.filtroScore === 'warm') return c.score >= 40 && c.score < 70;
          if (this.filtroScore === 'cold') return c.score < 40;
          return true;
        });
      }

      // Search filter
      if (this.busqueda.trim()) {
        const q = this.busqueda.toLowerCase();
        list = list.filter(c => (c.contacto || '').toLowerCase().includes(q) || (c.resolucion || '').toLowerCase().includes(q));
      }

      // Sort by date descending (most recent first)
      list.sort((a, b) => {
        const dateA = new Date(a.fechaModificacion || a.fechaCreacion || 0);
        const dateB = new Date(b.fechaModificacion || b.fechaCreacion || 0);
        return dateB - dateA;
      });

      return list;
    },
  },
  async mounted() {
    await this.cargar(true);
    if (!this.agenteId) this.iniciarPolling();
    this.cargarAgentes();
    this.cargarPosts();
    document.addEventListener('click', this.cerrarEmojiPickerSiEsAfuera, true);
  },
  beforeDestroy() {
    this.detenerPolling();
    document.removeEventListener('click', this.cerrarEmojiPickerSiEsAfuera, true);
  },
  methods: {
    async crearOportunidad() {
      if (!this.seleccionada) return;
      this.creandoOportunidad = true;
      try {
        const canal = this.seleccionada.canal || 'otro';
        const data = await this.$service.post('oportunidades', {
          contactoNombre: this.nombreRemitente(this.seleccionada),
          contactoTelefono: canal === 'whatsapp' ? this.seleccionada.contacto : undefined,
          origen: ['whatsapp', 'facebook', 'instagram'].includes(canal) ? canal : 'otro',
          conversacionId: this.seleccionada.id,
        });
        this.$message.success(`Oportunidad ${data && data.numeroOportunidad ? data.numeroOportunidad : ''} creada — revisa el módulo Oportunidades`);
      } catch (e) {
        this.$message.error('No se pudo crear la oportunidad');
      } finally {
        this.creandoOportunidad = false;
      }
    },
    async crearCasoSoporte() {
      if (!this.seleccionada) return;
      this.creandoCaso = true;
      try {
        const data = await this.$service.post('soporte', {
          conversacionId: this.seleccionada.id,
          nombreContacto: this.nombreRemitente(this.seleccionada),
          prioridad: 'media',
        });
        this.$message.success(`Caso ${data && data.numeroCaso ? data.numeroCaso : ''} creado — revisa el módulo Soporte`);
      } catch (e) {
        this.$message.error('No se pudo crear el caso de soporte');
      } finally {
        this.creandoCaso = false;
      }
    },
    async cargar(mostrarSpinner = false) {
      try {
        if (mostrarSpinner) this.loading = true;
        const lista = await this.fetchSilencioso('conversaciones', this.agenteId ? { agenteId: this.agenteId } : {});
        if (!lista) return;

        // Sort by date descending (most recent first)
        lista.sort((a, b) => {
          const dateA = new Date(a.fechaModificacion || a.fechaCreacion || 0);
          const dateB = new Date(b.fechaModificacion || b.fechaCreacion || 0);
          return dateB - dateA;
        });

        this.conversaciones = lista;
        if (this.seleccionadaId) {
          const fresca = lista.find(c => c.id === this.seleccionadaId);
          if (fresca) {
            const prevCount = this.seleccionada ? (this.seleccionada.totalMensajes || 0) : 0;
            this.seleccionada = fresca;
            if (fresca.totalMensajes > prevCount) this.$nextTick(this.scrollAbajo);
          }
        }
      } finally {
        if (mostrarSpinner) this.loading = false;
      }
    },

    async cargarAgentes() {
      try {
        const lista = await this.$service.get('agentes');
        if (lista) this.agentesDisponibles = Array.isArray(lista) ? lista : (lista.datos || []);
      } catch (_e) { /* ignore */ }
    },

    async cargarPosts() {
      try {
        const lista = await this.$service.get('red-social/posts');
        if (lista) this.posts = Array.isArray(lista) ? lista : (lista.datos || []);
      } catch (_e) { /* ignore */ }
    },

    resolverPostDeConversacion(conv) {
      if (!conv || !conv.contacto) return null;
      // Extrae el postId parcial del contacto: fb_cm_{postId}_{commentId}
      const m = conv.contacto.match(/^fb_cm_(.+)_[^_]+$/) || conv.contacto.match(/^fb_comment_(.+)_[^_]+$/);
      if (!m) return null;
      const partialPostId = m[1];
      return this.posts.find(p => p.postId && p.postId.includes(partialPostId)) || null;
    },

    async fetchSilencioso(url, query) {
      const qs = query && Object.keys(query).length ? '?' + Object.entries(query).map(([k, v]) => `${k}=${v}`).join('&') : '';
      const base = this.$baseServer || '';
      try {
        const res = await this.$http.get(base + url + qs);
        const d = res.data;
        if (d && typeof d === 'object' && 'finalizado' in d) return d.datos;
        return d;
      } catch (_e) { return null; }
    },

    volverALista() {
      this.seleccionada = null;
      this.seleccionadaId = null;
      this.panelDetalleAbierto = false;
    },
    async seleccionar(conv) {
      this.seleccionadaId = conv.id;
      this.seleccionada = conv;
      this.panelDetalleAbierto = false;
      this.postRelacionado = this.resolverPostDeConversacion(conv);
      this.respuesta = '';
      this.errorEnvio = null;
      this.notaInterna = conv.notas || '';
      this.agenteAsignadoIA = conv.agenteId || '';
      this.editandoNombre = false;
      this.nuevoNombre = this.nombreRemitente(conv);
      this.$nextTick(this.scrollAbajo);
      try {
        this.cargandoMensajes = true;
        const fresca = await this.$service.get(`conversaciones/${conv.id}`);
        if (fresca) {
          this.seleccionada = fresca;
          this.notaInterna = fresca.notas || '';
          this.agenteAsignadoIA = fresca.agenteId || '';
          this.nuevoNombre = this.nombreRemitente(fresca);
          this.$nextTick(this.scrollAbajo);
          const idx = this.conversaciones.findIndex(c => c.id === conv.id);
          if (idx !== -1) this.conversaciones.splice(idx, 1, fresca);
        }
      } catch (_e) { /* silently ignore */ } finally {
        this.cargandoMensajes = false;
      }
    },

    iniciarPolling() {
      this.pollingActivo = true;
      this.pollTimer = setInterval(() => this.cargar(false), POLL_INTERVAL);
    },
    detenerPolling() {
      this.pollingActivo = false;
      if (this.pollTimer) { clearInterval(this.pollTimer); this.pollTimer = null; }
    },

    onEmojiSeleccionado(emoji) {
      this.respuesta += emoji.native;
      this.mostrarEmojiPicker = false;
    },

    cerrarEmojiPickerSiEsAfuera(event) {
      if (!this.mostrarEmojiPicker) return;
      const wrap = this.$el.querySelector && this.$el.querySelector('.cv-emoji-wrap');
      if (wrap && !wrap.contains(event.target)) this.mostrarEmojiPicker = false;
    },

    onArchivoElegido(event) {
      const file = event.target.files && event.target.files[0];
      event.target.value = ''; // permite volver a elegir el mismo archivo después
      if (!file) return;
      this.archivoSeleccionado = file;
      this.previsualizacionUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
    },

    cancelarArchivo() {
      if (this.previsualizacionUrl) URL.revokeObjectURL(this.previsualizacionUrl);
      this.archivoSeleccionado = null;
      this.previsualizacionUrl = null;
    },

    async enviarRespuesta() {
      const texto = this.respuesta.trim();
      if ((!texto && !this.archivoSeleccionado) || this.enviando || this.subiendoArchivo || !this.seleccionada) return;
      this.enviando = true;
      this.errorEnvio = null;
      try {
        const canal = this.seleccionada.canal;
        let adjunto = null;

        if (this.archivoSeleccionado) {
          this.subiendoArchivo = true;
          const formData = new FormData();
          formData.append('file', this.archivoSeleccionado);
          adjunto = await this.$service.post('whatsapp/upload', formData);
          this.subiendoArchivo = false;

          if (canal === 'whatsapp') {
            await this.$service.post('whatsapp/send-adjunto', {
              celular: this.seleccionada.contacto,
              url: adjunto.url,
              tipo: adjunto.tipo,
              nombre: adjunto.nombre,
              caption: texto || undefined,
            });
          }
        } else if (canal === 'whatsapp') {
          await this.$service.post('whatsapp/send', { celular: this.seleccionada.contacto, mensaje: texto });
        } else if (canal === 'facebook' || canal === 'instagram') {
          await this.$service.post('red-social/send-dm', {
            recipientId: this.seleccionada.contacto,
            texto,
            plataforma: canal,
          });
        }
        await this.$service.post(`conversaciones/${this.seleccionada.id}/mensajes`, {
          role: 'assistant',
          content: texto,
          ...(adjunto ? { adjunto } : {}),
        });
        this.respuesta = '';
        this.cancelarArchivo();
        await this.seleccionar(this.seleccionada);
      } catch (e) {
        this.errorEnvio = e?.response?.data?.message || e?.message || 'Error al enviar el mensaje';
      } finally {
        this.enviando = false;
        this.subiendoArchivo = false;
      }
    },

    async cambiarEstado(nuevoEstado) {
      if (!this.seleccionada || this.seleccionada.estadoConversacion === nuevoEstado) return;
      try {
        await this.$service.patch(`conversaciones/${this.seleccionada.id}/estado`, { estadoConversacion: nuevoEstado });
        this.seleccionada = { ...this.seleccionada, estadoConversacion: nuevoEstado };
        const idx = this.conversaciones.findIndex(c => c.id === this.seleccionada.id);
        if (idx !== -1) this.conversaciones.splice(idx, 1, { ...this.conversaciones[idx], estadoConversacion: nuevoEstado });
      } catch (_e) { /* error mostrado por service interceptor */ }
    },

    eliminarConversacion(conv) {
      if (!conv) return;
      this.$confirm(`¿Eliminar la conversación con ${this.nombreRemitente(conv)}? Esta acción no se puede deshacer.`, async () => {
        this.eliminandoConversacion = true;
        try {
          await this.$service.delete(`conversaciones/${conv.id}`);
          this.conversaciones = this.conversaciones.filter(c => c.id !== conv.id);
          if (this.seleccionadaId === conv.id) {
            this.seleccionada = null;
            this.seleccionadaId = null;
          }
          this.$message.success('Conversación eliminada');
        } catch (e) {
          this.$message.error('No se pudo eliminar la conversación');
        } finally {
          this.eliminandoConversacion = false;
        }
      });
    },

    async guardarNota() {
      if (!this.seleccionada || !this.notaInterna.trim()) return;
      try {
        await this.$service.patch(`conversaciones/${this.seleccionada.id}/notas`, { notas: this.notaInterna });
        this.$message && this.$message.success('Nota guardada');
      } catch (e) {
        this.$message && this.$message.error('Error al guardar nota');
      }
    },

    async guardarAgenteAsignado(agenteId) {
      if (!this.seleccionada || !this.seleccionada.id) return;
      try {
        this.guarandoAgente = true;
        const payload = { agenteId: agenteId ? String(agenteId) : null };
        const datos = await this.$service.patch(`conversaciones/${this.seleccionada.id}`, payload);
        if (datos) {
          this.seleccionada = { ...this.seleccionada, ...datos };
          const idx = this.conversaciones.findIndex(c => c.id === this.seleccionada.id);
          if (idx !== -1) {
            this.conversaciones[idx] = { ...this.conversaciones[idx], ...datos };
          }
        }
        this.$message && this.$message.success('Agente asignado correctamente');
      } catch (e) {
        this.$message && this.$message.error('Error al asignar agente: ' + (e.message || 'Error desconocido'));
        this.agenteAsignadoIA = this.seleccionada?.agenteId || '';
      } finally {
        this.guarandoAgente = false;
      }
    },

    abrirEdicionNombre() {
      this.editandoNombre = true;
      this.nuevoNombre = this.nombreRemitente(this.seleccionada);
    },

    cancelarEdicion() {
      this.editandoNombre = false;
      this.nuevoNombre = this.nombreRemitente(this.seleccionada);
    },

    async guardarNombreYCerrar() {
      if (!this.seleccionada || !this.nuevoNombre.trim()) {
        console.log('[Guardar nombre] Cancelado: sin conversación o nombre vacío');
        this.editandoNombre = false;
        return;
      }

      const nombreAnterior = this.nombreRemitente(this.seleccionada);
      console.log('[Guardar nombre] Anterior:', nombreAnterior, 'Nuevo:', this.nuevoNombre.trim());

      if (this.nuevoNombre.trim() === nombreAnterior) {
        console.log('[Guardar nombre] Sin cambios, cancelando');
        this.editandoNombre = false;
        return;
      }

      try {
        const nombreGuardado = `Nombre: ${this.nuevoNombre.trim()}`;
        console.log('[Guardar nombre] Enviando PATCH a /conversaciones/' + this.seleccionada.id, { notas: nombreGuardado });

        const response = await this.$service.patch(`conversaciones/${this.seleccionada.id}`, { notas: nombreGuardado });
        console.log('[Guardar nombre] Respuesta:', response);

        if (response) {
          this.seleccionada = { ...this.seleccionada, notas: nombreGuardado };
          const idx = this.conversaciones.findIndex(c => c.id === this.seleccionada.id);
          if (idx !== -1) {
            this.conversaciones[idx] = { ...this.conversaciones[idx], notas: nombreGuardado };
          }
          console.log('[Guardar nombre] Actualización completada en UI');
          this.$message && this.$message.success('Nombre del contacto actualizado');
        } else {
          console.log('[Guardar nombre] Respuesta vacía');
        }
      } catch (e) {
        console.error('[Guardar nombre] Error:', e);
        this.$message && this.$message.error('Error al guardar nombre: ' + (e.message || 'desconocido'));
      } finally {
        this.editandoNombre = false;
      }
    },

    async agregarEtiqueta() {
      const etiqueta = this.nuevaEtiqueta.trim();
      if (!etiqueta || !this.seleccionada) return;

      const etiquetas = [...(this.seleccionada.etiquetas || [])];
      if (etiquetas.includes(etiqueta)) {
        this.$message && this.$message.warning('Esta etiqueta ya existe');
        return;
      }

      etiquetas.push(etiqueta);
      try {
        const datos = await this.$service.patch(`conversaciones/${this.seleccionada.id}`, { etiquetas });
        if (datos) {
          this.seleccionada = { ...this.seleccionada, ...datos };
          const idx = this.conversaciones.findIndex(c => c.id === this.seleccionada.id);
          if (idx !== -1) {
            this.conversaciones[idx] = { ...this.conversaciones[idx], ...datos };
          }
          this.$message && this.$message.success('Etiqueta agregada');
        }
        this.nuevaEtiqueta = '';
        this.dialogNuevaEtiqueta = false;
      } catch (e) {
        this.$message && this.$message.error('Error al agregar etiqueta');
      }
    },

    async eliminarEtiqueta(etiqueta) {
      if (!this.seleccionada) return;
      const etiquetas = (this.seleccionada.etiquetas || []).filter(t => t !== etiqueta);
      try {
        const datos = await this.$service.patch(`conversaciones/${this.seleccionada.id}`, { etiquetas });
        if (datos) {
          this.seleccionada = { ...this.seleccionada, ...datos };
          const idx = this.conversaciones.findIndex(c => c.id === this.seleccionada.id);
          if (idx !== -1) {
            this.conversaciones[idx] = { ...this.conversaciones[idx], ...datos };
          }
          this.$message && this.$message.success('Etiqueta eliminada');
        }
      } catch (e) {
        this.$message && this.$message.error('Error al eliminar etiqueta');
      }
    },

    scrollAbajo() {
      const el = this.$refs.msgContainer;
      if (el) el.scrollTop = el.scrollHeight;
    },

    ultimoMensaje(conv) {
      if (!conv.mensajes || !conv.mensajes.length) return conv.resolucion || 'Sin mensajes';
      const ultimo = conv.mensajes[conv.mensajes.length - 1];
      return ultimo.content || '';
    },

    ultimaActividad(conv) {
      if (!conv.mensajes || !conv.mensajes.length) return 'Hoy';
      const ultimo = conv.mensajes[conv.mensajes.length - 1];
      const d = ultimo.timestamp || conv.fechaCreacion;
      if (!d) return 'Hoy';
      const date = new Date(d);
      const now = new Date();
      if (date.toDateString() === now.toDateString()) return 'Hoy';
      return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
    },

    etiquetasConv(conv) {
      const tags = [];
      if (conv.score >= 70) tags.push({ label: 'Hot', color: '#ef4444' });
      else if (conv.score >= 40) tags.push({ label: 'Warm', color: '#f59e0b' });
      else tags.push({ label: 'Cold', color: '#3b82f6' });
      if (conv.score >= 65) tags.push({ label: 'Venta', color: '#f97316' });
      if (conv.escalado) tags.push({ label: 'Reclamo', color: '#ef4444' });
      if (conv.estadoConversacion === 'pendiente') tags.push({ label: 'Pendiente', color: '#8b5cf6' });
      return tags;
    },

    unreadCount(conv) {
      if (!conv.mensajes || !conv.mensajes.length) return 0;
      const recent = conv.mensajes.slice(-5);
      return recent.filter(m => m.role === 'user').length;
    },

    scoreColor(s) { return s >= 70 ? '#22c55e' : s >= 40 ? '#f59e0b' : '#ef4444'; },

    canalColor(c) {
      const m = { whatsapp: '#25D366', instagram: '#E1306C', facebook: '#1877F2', tiktok: '#69C9D0', chat: '#818cf8' };
      return m[c] || 'var(--text-faint)';
    },

    canalEmoji(c) {
      const m = { instagram: '📸', facebook: '📘', tiktok: '🎵', chat: '💬' };
      return m[c] || '💬';
    },

    canalLabel(c) {
      const m = { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', chat: 'Chat Web' };
      return m[c] || c;
    },

    displayContacto(conv) {
      if (conv.canal === 'facebook' && conv.contacto &&
          (conv.contacto.startsWith('fb_cm_') || conv.contacto.startsWith('fb_comment_'))) {
        // Line 1: show post title from notas
        if (conv.notas && conv.notas.startsWith('Post:')) {
          return conv.notas.replace('Post:', '').trim().slice(0, 45);
        }
        return 'Post de Facebook';
      }
      return conv.contacto || '—';
    },

    limpiarContenido(content) {
      if (!content) return '';
      // Quita el prefijo "[Comentario de NAME]: " del texto del mensaje
      const match = content.match(/^\[Comentario de .+?\]: (.+)$/s);
      return match ? match[1].trim() : content;
    },

    // El backend guarda un texto placeholder ("[Imagen adjunta]", etc.) cuando el
    // adjunto no trae caption — evita mostrar ese texto duplicado junto al archivo.
    esPlaceholderAdjunto(msg) {
      if (!msg.adjunto || !msg.content) return false;
      return /^\[(Imagen adjunta|Documento adjunto|Nota de voz \/ audio adjunto)/.test(msg.content);
    },

    abrirAdjunto(url) {
      window.open(url, '_blank', 'noopener');
    },

    linkMapa(ubicacion) {
      return `https://www.google.com/maps?q=${ubicacion.latitud},${ubicacion.longitud}`;
    },

    nombreRemitente(conv) {
      // WhatsApp: mostrar nombre guardado en notas en vez del número
      if (conv.canal === 'whatsapp' && conv.notas && conv.notas.startsWith('Nombre:')) {
        return conv.notas.replace('Nombre:', '').trim();
      }
      // Facebook comentario: extraer nombre del primer mensaje
      if (conv.canal === 'facebook' && conv.contacto &&
          (conv.contacto.startsWith('fb_cm_') || conv.contacto.startsWith('fb_comment_'))) {
        const primer = (conv.mensajes && conv.mensajes[0] && conv.mensajes[0].content) || '';
        const match = primer.match(/\[Comentario de (.+?)\]:/);
        if (match) return match[1].trim();
        return 'Comentarista';
      }
      return conv.contacto || '—';
    },

    chatHandle(conv) {
      if (conv.canal === 'facebook' && conv.contacto &&
          (conv.contacto.startsWith('fb_cm_') || conv.contacto.startsWith('fb_comment_'))) {
        if (conv.notas && conv.notas.startsWith('Post:')) {
          return conv.notas.replace('Post:', '').trim().slice(0, 50);
        }
        return 'Post de Facebook';
      }
      const prefix = conv.canal === 'whatsapp' ? 'wa/' : conv.canal === 'facebook' ? 'fb/' : conv.canal === 'instagram' ? 'ig/' : '';
      return prefix + (conv.contacto || '');
    },

    displayMensajePreview(conv) {
      if (conv.canal === 'facebook' && conv.contacto &&
          (conv.contacto.startsWith('fb_cm_') || conv.contacto.startsWith('fb_comment_'))) {
        const primer = (conv.mensajes && conv.mensajes[0] && conv.mensajes[0].content) || '';
        const match = primer.match(/\[Comentario de (.+?)\]: (.+)/s);
        if (match) {
          const nombre = match[1].trim();
          const texto = match[2].trim();
          // Show real name when available; otherwise show comment text as preview
          return (nombre && nombre !== 'Anónimo' && nombre !== 'Usuario Facebook')
            ? nombre
            : `"${texto.slice(0, 45)}"`;
        }
        return 'Comentario';
      }
      return this.ultimoMensaje(conv);
    },

    displaySubtitulo(conv) {
      if ((conv.canal === 'facebook') && conv.notas && conv.notas.startsWith('Post:')) {
        return conv.notas.replace('Post:', '').trim().slice(0, 50);
      }
      return null;
    },

    formatTime(d) {
      if (!d) return '';
      const date = new Date(d);
      const now = new Date();
      if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
      const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
      return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
    },

    formatDate(d) {
      if (!d) return '';
      return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    },
  },
};
</script>

<style scoped>
/* ═══════════════════════════════════
   ROOT LAYOUT
═══════════════════════════════════ */
.cv-root {
  display: flex;
  height: 100%;
  overflow: hidden;
  background: var(--bg-panel);
}

/* ═══════════════════════════════════
   LEFT COLUMN
═══════════════════════════════════ */
.cv-col-left {
  width: 320px;
  flex-shrink: 0;
  border-right: 1px solid var(--border-card);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-panel);
}

/* Header */
.cv-left-header {
  padding: 14px 14px 10px;
  border-bottom: 1px solid var(--border-card);
  flex-shrink: 0;
}
.cv-left-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.cv-left-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.cv-left-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-heading);
}
.cv-left-header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* "+ Nueva" button */
.cv-nueva-btn {
  height: 30px;
  padding: 0 12px;
  border-radius: 7px;
  background: #3b82f6;
  border: none;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
  white-space: nowrap;
}
.cv-nueva-btn:hover { background: #2563eb; }

/* Search */
.cv-search-wrap {
  position: relative;
}
.cv-search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}
.cv-search {
  width: 100%;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-heading);
  font-size: 13px;
  padding: 8px 12px 8px 32px;
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.15s;
}
.cv-search:focus { border-color: #6366f1; }

/* Channel tabs */
.cv-tabs-bar {
  display: flex;
  border-bottom: 1px solid var(--border-card);
  overflow-x: auto;
  padding: 0 8px;
  flex-shrink: 0;
  scrollbar-width: none;
}
.cv-tabs-bar::-webkit-scrollbar { display: none; }
.cv-tab {
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px 10px 8px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  color: var(--text-faint);
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
  font-family: inherit;
}
.cv-tab--active { color: #818cf8; border-bottom-color: #6366f1; }

/* Status pills */
.cv-pills-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-card);
  flex-shrink: 0;
}
.cv-pill {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--text-faint);
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  white-space: nowrap;
}
.cv-pill:hover { border-color: #6366f1; color: #a5b4fc; }
.cv-pill--active { background: #6366f122; border-color: #6366f155; color: #818cf8; }

/* Filter select boxes */
.cv-filter-select {
  padding: 5px 8px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-heading);
  font-size: 11px;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.15s;
  outline: none;
}
.cv-filter-select:hover { border-color: #6366f1; }
.cv-filter-select:focus { border-color: #6366f1; }

/* Overlay modal */
.cv-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.65);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* List scroll area */
.cv-list-scroll {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}
.cv-list-scroll::-webkit-scrollbar { width: 4px; }
.cv-list-scroll::-webkit-scrollbar-track { background: transparent; }
.cv-list-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

/* Conversation rows */
.cv-row {
  padding: 11px 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-card);
  border-left: 3px solid transparent;
  transition: all 0.15s;
}
.cv-row:hover { background: #6366f108; }
.cv-row--active { background: #6366f115; border-left-color: #6366f1; }
.cv-row-inner { display: flex; align-items: flex-start; gap: 9px; }

/* Avatar wrap with online dot */
.cv-avatar-wrap { position: relative; flex-shrink: 0; }
.cv-online-dot {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #22c55e;
  border: 2px solid var(--bg-panel);
}

/* Row body */
.cv-row-body { flex: 1; min-width: 0; }
.cv-row-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2px;
}
.cv-row-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-heading);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 140px;
}
.cv-row-time { font-size: 10px; color: var(--text-faint); flex-shrink: 0; margin-left: 4px; }
.cv-row-preview {
  margin: 0 0 6px;
  font-size: 11.5px;
  color: var(--text-faint);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cv-row-tags-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.cv-row-tags { display: flex; flex-wrap: wrap; gap: 4px; }

/* Platform mini badge on avatar (redes sociales) */
.cv-platform-mini {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  font-size: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--bg-page);
}

/* Social mini-row at top of list item */
.cv-social-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 5px;
  flex-wrap: nowrap;
  overflow: hidden;
}
.cv-social-chip {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 999px;
}
.cv-post-chip {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 999px;
  background: #22c55e22;
  color: #22c55e;
  border: 1px solid #22c55e33;
}
.cv-social-title {
  font-size: 10px;
  color: var(--text-faint);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 120px;
}

/* ═══════════════════════════════════
   MIDDLE COLUMN
═══════════════════════════════════ */
.cv-col-mid {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  background: var(--bg-panel);
}

/* Chat header */
.cv-chat-header {
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-card);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  background: var(--bg-panel);
}
.cv-chat-header-left { display: flex; align-items: center; gap: 10px; }
.cv-chat-avatar-wrap { position: relative; flex-shrink: 0; }
.cv-platform-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--bg-panel);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  line-height: 1;
}
.cv-chat-name { font-size: 14px; font-weight: 700; color: var(--text-heading); }
.cv-chat-meta {
  font-size: 11px;
  color: var(--text-faint);
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}
.cv-chat-meta-icon { font-size: 11px; }
.cv-chat-handle { color: var(--text-faint); }
.cv-chat-sep { color: var(--border); }
.cv-status-dot { font-size: 8px; }
.cv-chat-estado { font-size: 11px; }
.cv-chat-header-right { display: flex; align-items: center; gap: 8px; }
.cv-score-badge { font-size: 13px; font-weight: 700; }
.cv-detalle-btn {
  padding: 5px 12px;
  border-radius: 7px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.cv-detalle-btn:hover { border-color: #6366f1; color: #818cf8; }

/* Messages area */
.cv-messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}
.cv-messages-area::-webkit-scrollbar { width: 4px; }
.cv-messages-area::-webkit-scrollbar-track { background: transparent; }
.cv-messages-area::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

.cv-no-msgs {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-disabled);
  font-size: 13px;
}

/* System pill */
.cv-system-pill {
  align-self: center;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--text-faint);
  font-size: 11px;
  padding: 5px 14px;
  text-align: center;
  max-width: 80%;
}

/* Message rows — USER: LEFT, AGENT: RIGHT */
.cv-msg-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}
.cv-msg-row--user { justify-content: flex-start; }
.cv-msg-row--agent { justify-content: flex-end; }

.cv-msg-content { max-width: 64%; }
.cv-msg-content--agent { display: flex; flex-direction: column; align-items: flex-end; }

.cv-msg-meta { font-size: 10px; color: var(--text-disabled); margin-top: 3px; }
.cv-msg-meta--left { text-align: left; }
.cv-msg-meta--right { text-align: right; }
.cv-msg-time { margin-left: 4px; }

/* Chat bubbles */
.cv-bubble {
  padding: 10px 14px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-heading);
  word-break: break-word;
}
/* USER messages: dark background, left side */
.cv-bubble--user {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 4px 16px 16px 16px;
}
/* AGENT/AI messages: purple gradient, right side */
.cv-bubble--ai {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border-radius: 16px 4px 16px 16px;
}

/* Adjuntos (imagen/documento/audio recibidos o enviados) */
.cv-adjunto { margin-bottom: 4px; }
.cv-adjunto-img {
  max-width: 260px;
  max-height: 260px;
  border-radius: 12px;
  border: 1px solid var(--border-card);
  cursor: pointer;
  display: block;
}
.cv-adjunto-audio { max-width: 260px; height: 36px; }
.cv-adjunto-doc {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid var(--border-card);
  background: var(--bg-surface);
  color: var(--text-heading);
  font-size: 12px;
  text-decoration: none;
  max-width: 260px;
}
.cv-adjunto-doc:hover { border-color: #6366f1; }

/* Chips de opciones (preguntar_opciones) — muestran los botones tal como se mandaron */
.cv-opciones-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; justify-content: flex-end; }
.cv-opciones-chip {
  font-size: 11px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 999px;
  border: 1px solid #6366f155;
  color: #818cf8;
  background: #6366f118;
}
.cv-enlace-chip { text-decoration: none; cursor: pointer; }
.cv-enlace-chip:hover { background: #6366f130; }

/* Small avatars for messages */
.cv-avatar-sm {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}
.cv-avatar-user { /* set dynamically via :style */ }
.cv-avatar-agent { background: #c9644233; color: #e8956d; }

/* Typing indicator */
.cv-typing { display: flex; align-items: center; gap: 4px; padding: 12px 16px; }
.cv-typing span { width: 6px; height: 6px; border-radius: 50%; background: #c4b5fd; display: inline-block; animation: cv-bounce 1.2s infinite; }
.cv-typing span:nth-child(2) { animation-delay: 0.2s; }
.cv-typing span:nth-child(3) { animation-delay: 0.4s; }

/* Input area */
.cv-input-area {
  padding: 12px 16px;
  border-top: 1px solid var(--border-card);
  flex-shrink: 0;
  background: var(--bg-panel);
}
.cv-error-bar {
  font-size: 11px;
  color: #ef4444;
  margin-bottom: 6px;
  padding: 6px 10px;
  background: #ef444410;
  border-radius: 6px;
  border: 1px solid #ef444430;
}
.cv-input-box {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 8px 10px;
  transition: border-color 0.15s;
}
.cv-input-box--focus { border-color: #6366f1; }
.cv-wa-hint {
  font-size: 10px;
  color: var(--text-disabled);
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* No selection placeholder */
.cv-no-selection {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-disabled);
  font-size: 13px;
  flex-direction: column;
  gap: 12px;
}

/* ═══════════════════════════════════
   RIGHT COLUMN
═══════════════════════════════════ */
.cv-col-right {
  width: 280px;
  flex-shrink: 0;
  border-left: 1px solid var(--border-card);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background: var(--bg-panel);
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}
.cv-col-right::-webkit-scrollbar { width: 4px; }
.cv-col-right::-webkit-scrollbar-track { background: transparent; }
.cv-col-right::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

/* Panel sections */
.cv-panel-section { padding: 14px 16px; border-bottom: 1px solid var(--border-card); }
.cv-panel-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 10px;
}

/* Origen section */
.cv-origen-body { display: flex; flex-direction: column; gap: 8px; }
.cv-origen-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.cv-origen-platform-chip {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 999px;
}
.cv-origen-type-chip {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 999px;
  background: #22c55e22;
  color: #22c55e;
  border: 1px solid #22c55e33;
}
.cv-post-thumb {
  width: 100%;
  height: 110px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.cv-post-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}
.cv-post-text {
  margin: 0;
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.cv-post-metrics {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: var(--text-faint);
}
.cv-post-metrics span { display: flex; align-items: center; gap: 3px; }
.cv-ver-post-link { font-size: 11px; color: #3b82f6; text-decoration: none; }
.cv-ver-post-link:hover { text-decoration: underline; }

/* Contact rows */
.cv-panel-rows { display: flex; flex-direction: column; gap: 8px; }
.cv-panel-row { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-muted); }

/* Score */
.cv-score-row { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.cv-score-track {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background: var(--bg-surface);
  overflow: hidden;
}
.cv-score-fill { height: 100%; border-radius: 4px; transition: width 0.4s; }
.cv-score-num { font-size: 16px; font-weight: 900; min-width: 28px; text-align: right; }

/* Pipeline */
.cv-pipeline-chips { display: flex; flex-wrap: wrap; gap: 5px; }
.cv-pipeline-chip {
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.cv-pipeline-chip--active { font-weight: 700; }

/* Etiquetas */
.cv-tags-row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }

/* Agente */
.cv-agente-wrap { display: flex; align-items: center; gap: 8px; }
.cv-agente-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}

/* Nota interna */
.cv-nota-textarea {
  width: 100%;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-muted);
  font-size: 12px;
  padding: 9px 12px;
  outline: none;
  resize: none;
  font-family: inherit;
  line-height: 1.5;
  box-sizing: border-box;
  transition: border-color 0.15s;
}
.cv-nota-textarea:focus { border-color: #6366f1; }
.cv-nota-textarea::placeholder { color: var(--text-disabled); }
.cv-guardar-nota-btn {
  width: 100%;
  margin-top: 8px;
  padding: 8px;
  border-radius: 8px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.cv-guardar-nota-btn:hover:not(:disabled) { border-color: #6366f1; color: #818cf8; background: #6366f110; }
.cv-guardar-nota-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ═══════════════════════════════════
   SHARED / UTILITY
═══════════════════════════════════ */

/* Avatars */
.cv-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}
.cv-avatar-md {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

/* Tags */
.cv-tag { font-size: 10px; font-weight: 600; padding: 1px 7px; border-radius: 999px; }
.cv-count-badge {
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #6366f1;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}
.cv-unread-badge {
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  flex-shrink: 0;
}

/* Add tag button */
.cv-add-tag-btn {
  background: transparent;
  border: 1px dashed var(--border);
  border-radius: 999px;
  color: var(--text-faint);
  font-size: 10px;
  font-weight: 600;
  padding: 1px 8px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.cv-add-tag-btn:hover { border-color: #6366f1; color: #818cf8; }

/* Select */
.cv-select {
  flex: 1;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 7px;
  color: var(--text-muted);
  font-size: 12px;
  padding: 7px 28px 7px 10px;
  outline: none;
  font-family: inherit;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-color: var(--bg-surface);
}
.cv-select:focus { border-color: #6366f1; }

/* Resolver button */
.cv-resolver-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 7px;
  border: 1px solid #22c55e55;
  background: #22c55e15;
  color: #22c55e;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.cv-resolver-btn:hover { background: #22c55e22; }
.cv-resolver-btn--done { cursor: default; opacity: 0.6; }

/* Input actions */
.cv-icon-action-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-faint);
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition: color 0.15s;
  flex-shrink: 0;
}
.cv-icon-action-btn:hover { color: var(--text-muted); }
.cv-icon-action-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* Selector de emojis */
.cv-emoji-wrap { position: relative; }
.cv-emoji-popover {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  z-index: 60;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
  border: 1px solid var(--border);
}

/* Previsualización de adjunto antes de enviar */
.cv-adjunto-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  margin-bottom: 8px;
  border-radius: 10px;
  border: 1px solid var(--border-card);
  background: var(--bg-surface);
  width: fit-content;
  max-width: 100%;
}
.cv-adjunto-preview-img { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; }
.cv-adjunto-preview-doc { font-size: 12px; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 220px; }
.cv-adjunto-preview-quitar {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-faint);
  font-size: 13px;
  padding: 2px 4px;
  flex-shrink: 0;
}
.cv-adjunto-preview-quitar:hover { color: #ef4444; }

.cv-reply-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-heading);
  font-size: 13px;
  padding: 4px 6px;
  outline: none;
  font-family: inherit;
  resize: none;
  line-height: 1.5;
  max-height: 120px;
}
.cv-reply-input::placeholder { color: var(--text-disabled); }
.cv-reply-input:disabled { opacity: 0.5; cursor: not-allowed; }
.cv-send-btn {
  height: 36px;
  padding: 0 14px;
  border-radius: 8px;
  background: #3b82f6;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: background 0.15s;
  flex-shrink: 0;
  font-family: inherit;
}
.cv-send-btn:hover:not(:disabled) { background: #2563eb; }
.cv-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.cv-send-label { font-size: 12px; font-weight: 600; margin-left: 4px; }

/* Refresh button */
.cv-refresh-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-disabled);
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}
.cv-refresh-btn:hover { color: #818cf8; }

/* Pulse dot (polling indicator) */
.cv-pulse-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; animation: cv-pulse 2s infinite; }

/* Compact embedded mode */
.cv-compact-empty {
  text-align: center;
  padding: 48px;
  color: var(--text-faint);
}
.cv-compact-row {
  padding: 12px 14px;
  background: var(--bg-surface);
  border-radius: 10px;
  border: 1px solid var(--border-card);
  cursor: pointer;
  transition: border-color 0.15s;
}
.cv-compact-row:hover { border-color: #6366f144; }

/* Utility */
.cv-center-pad { display: flex; justify-content: center; padding: 32px; }
.cv-empty-list { padding: 32px; text-align: center; color: var(--text-disabled); font-size: 13px; }

/* Spinners */
.cv-spinner {
  border-radius: 50%;
  border-style: solid;
  border-color: #6366f1 #6366f133 #6366f133;
  animation: cv-spin 0.75s linear infinite;
  flex-shrink: 0;
}
.cv-spinner--28 { width: 28px; height: 28px; border-width: 3px; }
.cv-spinner--16 { width: 16px; height: 16px; border-width: 2px; }
.cv-spinner--14 { width: 14px; height: 14px; border-width: 2px; }
.cv-spinner--white { border-color: #fff #ffffff44 #ffffff44; }

/* Keyframes */
@keyframes cv-spin    { to { transform: rotate(360deg); } }
@keyframes cv-pulse   { 0%,100%{ opacity:1; transform:scale(1); } 50%{ opacity:0.5; transform:scale(0.8); } }
@keyframes cv-bounce  { 0%,80%,100%{ transform:translateY(0); } 40%{ transform:translateY(-6px); } }

/* ═══════════════════════════════════════════════════════════
   RESPONSIVE — teléfono y tablet 7"
   Desktop (≥900px): sin cambios, layout de 3 columnas original.
═══════════════════════════════════════════════════════════ */

/* Elementos nuevos, ocultos por defecto (desktop) — se activan en los media queries de abajo */
.cv-back-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  padding: 6px;
  margin-right: 2px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.cv-back-btn:hover { color: #818cf8; background: #6366f118; }

.cv-filtros-toggle-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-disabled);
  padding: 4px;
  border-radius: 6px;
  align-items: center;
  transition: color 0.15s;
}
.cv-filtros-toggle-btn:hover { color: #818cf8; }

.cv-detalle-close-btn {
  display: none;
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--bg-page);
  border: 1px solid var(--border-card);
  cursor: pointer;
  color: var(--text-muted);
  padding: 6px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.cv-detalle-backdrop {
  display: none;
}

/* ── Tablet 7" y teléfono: hasta 900px — un panel a la vez.
   Con el sidebar general (200px) presente, ni una tablet de 7" (~600-624px de
   ancho CSS en portrait) tiene lugar real para lista + chat a la vez sin que el
   chat quede ilegible — por eso el patrón de "un panel visible" aplica a ambos,
   no solo al teléfono. La diferencia entre tablet y teléfono queda en el
   segundo media query de abajo (filtros, ancho de burbujas, drawer). ── */
@media (max-width: 900px) {
  .cv-col-left { width: 100%; }
  .cv-col-left--oculta-movil { display: none; }

  .cv-col-mid { display: none; }
  .cv-col-mid--activa-movil { display: flex; width: 100%; }

  .cv-back-btn { display: flex; }
  .cv-filtros-toggle-btn { display: flex; }

  /* Panel de detalle pasa a drawer superpuesto en vez de 3ra columna fija */
  .cv-col-right {
    position: fixed;
    top: 0;
    right: 0;
    height: 100%;
    width: 320px;
    max-width: 85vw;
    transform: translateX(100%);
    transition: transform 0.25s ease;
    z-index: 50;
    box-shadow: -8px 0 24px rgba(0, 0, 0, 0.35);
  }
  .cv-col-right--abierto-movil { transform: translateX(0); }
  .cv-detalle-close-btn { display: flex; }
  .cv-detalle-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 49;
  }
}

/* ── Teléfono: hasta 480px — ajustes adicionales sobre el patrón de arriba ── */
@media (max-width: 480px) {
  /* Filtros de días/score colapsados por defecto para no robarle alto a la lista */
  .cv-filters-block { display: none; }
  .cv-filters-block--expandido { display: flex; }

  /* Burbujas de mensaje más anchas — en pantalla angosta el 64% queda apretado */
  .cv-msg-content { max-width: 88%; }

  /* Panel de detalle a todo el ancho en vez de drawer angosto */
  .cv-col-right { width: 100%; max-width: 100%; }

  /* Área táctil mínima recomendada (~40px) para botones de ícono */
  .cv-refresh-btn, .cv-filtros-toggle-btn, .cv-back-btn, .cv-icon-action-btn, .cv-detalle-close-btn {
    min-width: 36px;
    min-height: 36px;
    justify-content: center;
  }
  .cv-send-btn { min-height: 40px; }
}
</style>

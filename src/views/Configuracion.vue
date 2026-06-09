<template>
  <div class="ide-mod">

    <!-- Sub-nav -->
    <div class="ide-subnav">
      <div class="ide-sn-hd">
        <div class="ide-sn-ico" style="background:linear-gradient(135deg,#c96442,#e8956d);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
        </div>
        <div>
          <div class="ide-sn-title">Configuración</div>
          <div class="ide-sn-sub" style="color:#c96442;">Sistema</div>
        </div>
      </div>

      <button v-for="s in secciones" :key="s.id" class="ide-sn-btn" :class="seccion === s.id ? 'ide-sn-btn--o' : ''" @click="seccion = s.id">
        <span v-html="s.svg" style="flex-shrink:0; display:flex;"></span>
        {{ s.label }}
        <span v-if="s.id === 'whatsapp' && waStatus.valida" style="margin-left:auto; width:7px; height:7px; border-radius:50%; background:#22c55e; flex-shrink:0;"></span>
      </button>
    </div>

    <!-- Content -->
    <div class="ide-body">

      <!-- SUPER_ADMIN without a clienteId context -->
      <div v-if="!clienteId" style="padding:40px 0; text-align:center; color:#475569;">
        <div style="font-size:32px; margin-bottom:12px;">🔐</div>
        <div style="font-size:15px; font-weight:700; color:#64748b; margin-bottom:6px;">Selecciona un cliente</div>
        <div style="font-size:12px;">La configuración se gestiona por cliente. Accede desde la sección <strong style="color:#818cf8;">Clientes</strong>.</div>
      </div>

      <template v-else>

      <!-- ── API Key ── -->
      <template v-if="seccion === 'api'">
        <div class="ide-sec-hd"><h2>Configuración API Anthropic</h2><p>Conecta Claude para activar todos los agentes IA</p></div>
        <div style="max-width:620px;">
          <div class="cfg-info-card">
            <div style="font-size:12px; font-weight:700; color:#e8956d; margin-bottom:8px;">🔑 ¿Cómo obtener tu API Key?</div>
            <div v-for="(step, i) in pasos" :key="i" style="display:flex; gap:10px; margin-bottom:6px;">
              <div class="cfg-step-num">{{ i+1 }}</div>
              <span style="font-size:12px; color:#94a3b8;"><strong style="color:#e2e8f0;">{{ step.bold }}:</strong> {{ step.text }}</span>
            </div>
            <a href="https://console.anthropic.com" target="_blank" style="display:inline-flex; align-items:center; gap:5px; margin-top:8px; font-size:11px; color:#e8956d; font-weight:600; text-decoration:none;">
              Ir a console.anthropic.com ↗
            </a>
          </div>

          <div class="cfg-form-row">
            <div class="ide-field">
              <label>API Key de Anthropic *</label>
              <div style="position:relative;">
                <input v-model="apiKey" :type="showKey ? 'text' : 'password'" class="ide-input" placeholder="sk-ant-api03-xxxxxxxxxxxxxxxx" />
                <button class="cfg-eye" @click="showKey = !showKey" type="button">{{ showKey ? '🙈' : '👁' }}</button>
              </div>
            </div>
            <div class="ide-field">
              <label>Modelo por defecto</label>
              <select v-model="modelo" class="ide-select">
                <option value="claude-haiku-4-5">Claude Haiku 4.5 — Rápido y económico</option>
                <option value="claude-sonnet-4-6">Claude Sonnet 4.6 — Equilibrio calidad/costo</option>
                <option value="claude-opus-4-7">Claude Opus 4.7 — Máxima calidad</option>
              </select>
            </div>
          </div>

          <div v-if="resultadoVerif" class="cfg-result" :class="resultadoVerif.ok ? 'cfg-result--ok' : 'cfg-result--err'">{{ resultadoVerif.msg }}</div>

          <div style="display:flex; gap:8px; margin-top:16px;">
            <v-btn depressed :color="resultadoVerif && resultadoVerif.ok ? 'success' : 'primary'" :loading="verificando" @click="verificarKey" style="font-size:12px; border-radius:8px;">
              {{ verificando ? 'Verificando…' : 'Verificar API Key' }}
            </v-btn>
            <v-btn v-if="resultadoVerif && resultadoVerif.ok" depressed color="primary" :loading="guardando" @click="guardarApiKey" style="font-size:12px; border-radius:8px;">
              Guardar configuración
            </v-btn>
          </div>
        </div>
      </template>

      <!-- ── Auto-respuesta ── -->
      <template v-else-if="seccion === 'canales'">
        <div class="ide-sec-hd"><h2>Auto-respuesta por canal</h2><p>Activa o desactiva el agente IA en cada canal</p></div>
        <div style="max-width:520px;">
          <div class="ide-ia-card" style="margin-bottom:16px;">
            <div style="display:flex; flex-direction:column; gap:12px;">
              <div v-for="canal in canales" :key="canal.id" style="display:flex; align-items:center; gap:12px; padding:10px 12px; background:#0f172a; border-radius:8px; border:1px solid #1e3a5f33;">
                <div style="font-size:20px; flex-shrink:0;">{{ canal.emoji }}</div>
                <span style="font-size:13px; color:#cbd5e1; flex:1;">{{ canal.label }}</span>
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-size:11px;" :style="{ color: canal.activo ? '#22c55e' : '#ef4444' }">{{ canal.activo ? 'Activo' : 'Inactivo' }}</span>
                  <div class="ide-toggle" :class="{ 'ide-toggle--on': canal.activo }" @click="canal.activo = !canal.activo"><div></div></div>
                </div>
              </div>
            </div>
          </div>
          <div style="display:flex; justify-content:flex-end;">
            <v-btn depressed color="primary" :loading="guardando" @click="guardarCanales" style="font-size:12px; border-radius:8px;">Guardar canales</v-btn>
          </div>
        </div>
      </template>

      <!-- ── Modelos ── -->
      <template v-else-if="seccion === 'modelos'">
        <div class="ide-sec-hd"><h2>Modelos disponibles</h2><p>Referencia de capacidades de cada modelo Claude</p></div>
        <div style="display:flex; flex-direction:column; gap:12px; max-width:620px;">
          <div v-for="m in modelosInfo" :key="m.id" class="ide-ia-card" :style="{ border: modelo === m.id ? '1px solid #c9644244' : '1px solid #1e3a5f33' }">
            <div style="display:flex; align-items:flex-start; gap:14px;">
              <div style="width:40px; height:40px; border-radius:10px; background:linear-gradient(135deg,#c96442,#e8956d); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0;">{{ m.emoji }}</div>
              <div style="flex:1;">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                  <span style="font-size:13px; font-weight:700; color:#e2e8f0;">{{ m.nombre }}</span>
                  <span v-if="m.recomendado" style="font-size:10px; font-weight:700; background:#22c55e22; color:#22c55e; padding:2px 7px; border-radius:999px;">Recomendado</span>
                </div>
                <div style="font-size:11px; color:#64748b; line-height:1.6; margin-bottom:10px;">{{ m.desc }}</div>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                  <span v-for="tag in m.tags" :key="tag" style="font-size:10px; font-weight:600; background:#6366f122; color:#818cf8; padding:2px 8px; border-radius:999px;">{{ tag }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ── WhatsApp Cloud ── -->
      <template v-else-if="seccion === 'whatsapp'">
        <div class="ide-sec-hd"><h2>WhatsApp Cloud API</h2><p>Conecta tu número de WhatsApp Business para que los agentes IA atiendan conversaciones</p></div>
        <div style="max-width:660px;">

          <!-- Status banner -->
          <div v-if="waStatus.valida" class="cfg-result cfg-result--ok" style="margin-bottom:20px; display:flex; align-items:center; gap:10px;">
            <span style="font-size:16px;">✅</span>
            <div>
              <div style="font-weight:700;">Canal conectado</div>
              <div v-if="waStatus.info" style="font-size:11px; margin-top:2px;">
                {{ waStatus.info.verifiedName }} · {{ waStatus.info.displayPhone }} · Calidad: {{ waStatus.info.qualityRating || 'N/D' }}
              </div>
            </div>
          </div>

          <!-- Setup guide -->
          <div class="cfg-info-card" style="margin-bottom:20px;">
            <div style="font-size:12px; font-weight:700; color:#25D366; margin-bottom:10px;">📱 Configuración en Meta for Developers</div>
            <div v-for="(step, i) in pasosWa" :key="i" style="display:flex; gap:10px; margin-bottom:8px; font-size:12px; color:#94a3b8;">
              <div class="cfg-step-num" style="background:#25D36633; color:#25D366;">{{ i+1 }}</div>
              <span><strong style="color:#e2e8f0;">{{ step.bold }}:</strong> {{ step.text }}</span>
            </div>
            <div style="margin-top:12px; padding:10px 12px; background:#0f172a; border-radius:8px; border:1px solid #25D36622;">
              <div style="font-size:11px; font-weight:700; color:#64748b; margin-bottom:6px;">URL del Webhook (copiar en Meta)</div>
              <div style="display:flex; align-items:center; gap:8px;">
                <code style="font-size:11px; color:#25D366; flex:1; word-break:break-all;">{{ webhookUrl }}</code>
                <button class="cfg-copy-btn" @click="copiar(webhookUrl)">Copiar</button>
              </div>
              <div style="margin-top:8px; font-size:11px; font-weight:700; color:#64748b; margin-bottom:4px;">Token de verificación</div>
              <div style="display:flex; align-items:center; gap:8px;">
                <code style="font-size:11px; color:#818cf8;">{{ waForm.verifyToken || 'ide_ia_verify_token' }}</code>
                <button class="cfg-copy-btn" @click="copiar(waForm.verifyToken || 'ide_ia_verify_token')">Copiar</button>
              </div>
            </div>
          </div>

          <!-- Credentials form -->
          <div class="ide-ia-card" style="margin-bottom:16px;">
            <div style="font-size:13px; font-weight:700; color:#e2e8f0; margin-bottom:14px;">Credenciales de la API</div>
            <div style="display:flex; flex-direction:column; gap:12px;">
              <div class="ide-field">
                <label>Access Token (token permanente o de sistema) *</label>
                <div style="position:relative;">
                  <input v-model="waForm.accessToken" :type="showWaToken ? 'text' : 'password'" class="ide-input" placeholder="EAAMKqRkf07MBQ…" />
                  <button class="cfg-eye" @click="showWaToken = !showWaToken" type="button">{{ showWaToken ? '🙈' : '👁' }}</button>
                </div>
              </div>
              <div class="cfg-form-row">
                <div class="ide-field">
                  <label>Phone Number ID *</label>
                  <input v-model="waForm.phoneNumberId" class="ide-input" placeholder="123456789012345" />
                  <div style="font-size:10px; color:#475569; margin-top:3px;">API → WhatsApp → Getting Started</div>
                </div>
                <div class="ide-field">
                  <label>WhatsApp Business Account ID</label>
                  <input v-model="waForm.wabaId" class="ide-input" placeholder="987654321098765" />
                  <div style="font-size:10px; color:#475569; margin-top:3px;">Business Manager → Configuración</div>
                </div>
              </div>
              <div class="ide-field">
                <label>Token de verificación del webhook</label>
                <input v-model="waForm.verifyToken" class="ide-input" placeholder="ide_ia_verify_token" />
                <div style="font-size:10px; color:#475569; margin-top:3px;">Puedes usar cualquier cadena — debe coincidir con lo que ingresas en Meta</div>
              </div>
            </div>
          </div>

          <!-- Test connection -->
          <div v-if="waTestResult" class="cfg-result" :class="waTestResult.valida ? 'cfg-result--ok' : 'cfg-result--err'" style="margin-bottom:12px;">
            {{ waTestResult.mensaje }}
            <div v-if="waTestResult.info" style="margin-top:6px; font-size:11px; opacity:0.9;">
              Número: {{ waTestResult.info.displayPhone }} · Estado: {{ waTestResult.info.status }} · Calidad: {{ waTestResult.info.qualityRating }}
            </div>
          </div>

          <div style="display:flex; gap:8px; margin-bottom:20px;">
            <v-btn depressed color="success" :loading="waTestando" :disabled="!waForm.accessToken || !waForm.phoneNumberId" @click="testConexionWa" style="font-size:12px; border-radius:8px; background:#25D36622 !important; color:#25D366 !important;">
              {{ waTestando ? 'Verificando…' : 'Probar conexión' }}
            </v-btn>
          </div>

          <!-- Agent assignment + enable -->
          <div class="ide-ia-card" style="margin-bottom:16px;">
            <div style="font-size:13px; font-weight:700; color:#e2e8f0; margin-bottom:14px;">Configuración del canal</div>
            <div style="display:flex; flex-direction:column; gap:14px;">
              <div class="ide-field">
                <label>Agente IA asignado a WhatsApp</label>
                <select v-model="waForm.agenteId" class="ide-select">
                  <option value="">— Sin agente asignado —</option>
                  <option v-for="ag in agentes" :key="ag.id" :value="ag.id">{{ ag.nombre }} ({{ ag.modelo }})</option>
                </select>
                <div style="font-size:10px; color:#475569; margin-top:3px;">Este agente responderá automáticamente los mensajes de WhatsApp</div>
              </div>
              <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 14px; background:#0f172a; border-radius:8px; border:1px solid #1e3a5f33;">
                <div>
                  <div style="font-size:13px; font-weight:700; color:#e2e8f0;">Canal WhatsApp activo</div>
                  <div style="font-size:11px; color:#64748b; margin-top:2px;">El agente responderá mensajes entrantes automáticamente</div>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                  <span style="font-size:12px; font-weight:600;" :style="{ color: waForm.enabled ? '#22c55e' : '#ef4444' }">{{ waForm.enabled ? 'Activo' : 'Inactivo' }}</span>
                  <div class="ide-toggle" :class="{ 'ide-toggle--on': waForm.enabled }" @click="waForm.enabled = !waForm.enabled"><div></div></div>
                </div>
              </div>
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end;">
            <v-btn depressed color="primary" :loading="guardando" @click="guardarWa" style="font-size:12px; border-radius:8px;">
              Guardar configuración WhatsApp
            </v-btn>
          </div>

        </div>
      </template>

      <!-- ── Redes Sociales (Facebook / Instagram / TikTok / LinkedIn) ── -->
      <template v-else-if="['facebook','instagram','tiktok','linkedin'].includes(seccion)">
        <div class="ide-sec-hd">
          <h2>{{ plataformasMeta[seccion].title }}</h2>
          <p>{{ plataformasMeta[seccion].desc }}</p>
        </div>
        <div style="max-width:700px;">

          <!-- Cuentas conectadas -->
          <div v-if="rsState.cuentas.length" style="margin-bottom:20px; display:flex; flex-direction:column; gap:10px;">
            <div v-for="cuenta in rsState.cuentas" :key="cuenta.id" class="rs-cuenta-card">
              <div style="display:flex; align-items:center; gap:12px; flex:1; min-width:0;">
                <div class="rs-cuenta-ico" :style="{ background: plataformasMeta[seccion].color + '22', color: plataformasMeta[seccion].color }" v-html="plataformasMeta[seccion].icon"></div>
                <div style="flex:1; min-width:0;">
                  <div style="font-size:13px; font-weight:700; color:#e2e8f0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ cuenta.nombre }}</div>
                  <div style="font-size:11px; color:#475569; font-family:monospace;">{{ cuenta.pageId }}</div>
                </div>
                <span class="ide-cl-status" :class="cuenta.enabled ? 'ide-cl-status--on' : 'ide-cl-status--off'" style="flex-shrink:0;">{{ cuenta.enabled ? 'Activo' : 'Inactivo' }}</span>
              </div>
              <div style="display:flex; gap:6px; flex-shrink:0;">
                <button class="ide-cl-btn" @click="editarCuentaRS(cuenta)" title="Editar">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="ide-cl-btn ide-cl-btn--danger" @click="eliminarCuentaRS(cuenta.id)" title="Eliminar">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                </button>
              </div>
            </div>
          </div>
          <div v-else-if="!rsState.cargando" class="ide-ia-card" style="text-align:center; padding:28px 20px; margin-bottom:20px;">
            <div style="font-size:24px; margin-bottom:8px;" v-html="plataformasMeta[seccion].icon"></div>
            <div style="font-size:13px; color:#64748b;">No hay cuentas de {{ plataformasMeta[seccion].title }} conectadas</div>
          </div>

          <!-- Botón conectar -->
          <div v-if="!rsForm.visible" style="margin-bottom:20px;">
            <v-btn depressed color="primary" @click="abrirFormRS" style="font-size:12px; border-radius:8px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Conectar cuenta de {{ plataformasMeta[seccion].title }}
            </v-btn>
          </div>

          <!-- Formulario -->
          <div v-else class="ide-ia-card" style="margin-bottom:16px;">
            <div style="font-size:13px; font-weight:700; color:#e2e8f0; margin-bottom:16px;">
              {{ rsForm.editandoId ? 'Editar cuenta' : 'Conectar nueva cuenta' }}
            </div>
            <div style="display:flex; flex-direction:column; gap:12px;">
              <div class="cfg-form-row">
                <div class="ide-field">
                  <label>Nombre de la cuenta *</label>
                  <input v-model="rsForm.nombre" class="ide-input" :placeholder="plataformasMeta[seccion].namePlaceholder" />
                </div>
                <div class="ide-field">
                  <label>{{ plataformasMeta[seccion].pageIdLabel }} *</label>
                  <input v-model="rsForm.pageId" class="ide-input" :placeholder="plataformasMeta[seccion].pageIdPlaceholder" />
                </div>
              </div>
              <div class="ide-field">
                <label>Access Token {{ rsForm.editandoId ? '(dejar vacío para no cambiar)' : '*' }}</label>
                <div style="position:relative;">
                  <input v-model="rsForm.accessToken" :type="rsForm.showToken ? 'text' : 'password'" class="ide-input" placeholder="EAAMKq…" />
                  <button class="cfg-eye" @click="rsForm.showToken = !rsForm.showToken" type="button">{{ rsForm.showToken ? '🙈' : '👁' }}</button>
                </div>
              </div>
              <div class="cfg-form-row">
                <div class="ide-field">
                  <label>App Secret {{ rsForm.editandoId ? '(opcional)' : '' }}</label>
                  <input v-model="rsForm.appSecret" type="password" class="ide-input" placeholder="abc123…" />
                </div>
                <div class="ide-field">
                  <label>Verify Token (webhook)</label>
                  <input v-model="rsForm.verifyToken" class="ide-input" placeholder="ide_ia_meta_token" />
                </div>
              </div>
              <div class="ide-field">
                <label>Agente IA asignado</label>
                <select v-model="rsForm.agenteId" class="ide-select">
                  <option value="">— Sin agente asignado —</option>
                  <option v-for="ag in agentes" :key="ag.id" :value="ag.id">{{ ag.nombre }} ({{ ag.modelo }})</option>
                </select>
              </div>
              <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 12px; background:#0f172a; border-radius:8px; border:1px solid #1e3a5f33;">
                <span style="font-size:12px; color:#cbd5e1;">Canal activo (responde automáticamente)</span>
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-size:11px; font-weight:600;" :style="{ color: rsForm.enabled ? '#22c55e' : '#ef4444' }">{{ rsForm.enabled ? 'Activo' : 'Inactivo' }}</span>
                  <div class="ide-toggle" :class="{ 'ide-toggle--on': rsForm.enabled }" @click="rsForm.enabled = !rsForm.enabled"><div></div></div>
                </div>
              </div>
            </div>

            <!-- Test connection result -->
            <div v-if="rsState.testResult" class="cfg-result" :class="rsState.testResult.valida ? 'cfg-result--ok' : 'cfg-result--err'" style="margin-top:12px;">
              {{ rsState.testResult.mensaje }}
            </div>

            <div style="display:flex; gap:8px; margin-top:16px; flex-wrap:wrap;">
              <v-btn v-if="plataformasMeta[seccion].hasTest" depressed color="success" :loading="rsState.testing"
                :disabled="!rsForm.accessToken || !rsForm.pageId"
                @click="testConexionRS"
                style="font-size:12px; border-radius:8px; background:#22c55e22 !important; color:#22c55e !important;">
                {{ rsState.testing ? 'Verificando…' : 'Probar conexión' }}
              </v-btn>
              <v-btn depressed color="primary" :loading="rsState.guardando" @click="guardarCuentaRS" style="font-size:12px; border-radius:8px;">
                {{ rsForm.editandoId ? 'Guardar cambios' : 'Conectar cuenta' }}
              </v-btn>
              <button class="ide-cl-btn-sec" @click="rsForm.visible = false; rsState.testResult = null">Cancelar</button>
            </div>
          </div>

          <!-- Webhook URL info for Meta platforms -->
          <div v-if="plataformasMeta[seccion].hasTest" class="cfg-info-card">
            <div style="font-size:12px; font-weight:700; color:#6366f1; margin-bottom:10px;">🔗 URL del Webhook para Meta</div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
              <code style="font-size:11px; color:#818cf8; flex:1; word-break:break-all;">{{ webhookUrlRS }}</code>
              <button class="cfg-copy-btn" @click="copiar(webhookUrlRS)">Copiar</button>
            </div>
            <div style="font-size:11px; color:#64748b;">Configura esta URL en Meta for Developers → Tu App → Webhooks</div>
          </div>

        </div>
      </template>

      </template><!-- end v-else clienteId -->

    </div>
  </div>
</template>

<script>
const SVGS = {
  key:       `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
  signal:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01"/></svg>`,
  cpu:       `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`,
  whatsapp:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
  facebook:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>`,
  instagram: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
  tiktok:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.2 8.2 0 004.79 1.53V6.74a4.84 4.84 0 01-1.02-.05z"/></svg>`,
  linkedin:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>`,
};

export default {
  name: 'Configuracion',
  data() {
    return {
      seccion: 'api',
      // Anthropic
      apiKey: '',
      modelo: 'claude-haiku-4-5',
      showKey: false,
      verificando: false,
      guardando: false,
      resultadoVerif: null,
      // WhatsApp
      waForm: {
        accessToken: '',
        phoneNumberId: '',
        wabaId: '',
        verifyToken: 'ide_ia_verify_token',
        agenteId: '',
        enabled: false,
      },
      waTestResult: null,
      waTestando: false,
      waStatus: { valida: false },
      showWaToken: false,
      agentes: [],
      // Nav
      secciones: [
        { id: 'api',       label: 'API Key IA',        svg: SVGS.key       },
        { id: 'canales',   label: 'Auto-respuesta',    svg: SVGS.signal    },
        { id: 'modelos',   label: 'Modelos Claude',    svg: SVGS.cpu       },
        { id: 'whatsapp',  label: 'WhatsApp Cloud',    svg: SVGS.whatsapp  },
        { id: 'facebook',  label: 'Facebook',          svg: SVGS.facebook  },
        { id: 'instagram', label: 'Instagram',         svg: SVGS.instagram },
        { id: 'tiktok',    label: 'TikTok',            svg: SVGS.tiktok    },
        { id: 'linkedin',  label: 'LinkedIn',          svg: SVGS.linkedin  },
      ],
      // Social network state
      rsState: {
        cuentas: [],
        cargando: false,
        guardando: false,
        testing: false,
        testResult: null,
      },
      rsForm: {
        visible: false,
        editandoId: null,
        nombre: '',
        pageId: '',
        accessToken: '',
        showToken: false,
        appSecret: '',
        verifyToken: 'ide_ia_meta_token',
        agenteId: '',
        enabled: true,
      },
      pasos: [
        { bold: 'Ir a',        text: 'console.anthropic.com → API Keys → Create Key' },
        { bold: 'Copiar',      text: 'la key que empieza con sk-ant-...' },
        { bold: 'Seleccionar', text: 'el modelo según tu plan (Haiku es más rápido y económico)' },
      ],
      pasosWa: [
        { bold: 'Crear app',         text: 'developers.facebook.com → Mis Apps → Crear app → Empresa' },
        { bold: 'Agregar WhatsApp',  text: 'Panel de la app → Agregar producto → WhatsApp → Configurar' },
        { bold: 'Número de teléfono',text: 'WhatsApp → Configuración → Agregar número de teléfono de producción' },
        { bold: 'Token permanente',  text: 'Configuración → Información del sistema → Crear token de sistema con whatsapp_business_messaging' },
        { bold: 'Configurar webhook',text: 'WhatsApp → Configuración → Webhook → Editar → Pegar URL y token de verificación → Verificar' },
        { bold: 'Suscribir campos',  text: 'Webhook → Administrar → Activar "messages"' },
      ],
      canales: [
        { id: 'whatsapp',  label: 'WhatsApp Cloud',     emoji: '💬', activo: true  },
        { id: 'instagram', label: 'Instagram DM',       emoji: '📷', activo: true  },
        { id: 'facebook',  label: 'Facebook Messenger', emoji: '📘', activo: false },
        { id: 'chat',      label: 'Chat Web',           emoji: '🌐', activo: true  },
      ],
      modelosInfo: [
        { id: 'claude-haiku-4-5',  emoji: '⚡', nombre: 'Claude Haiku 4.5',  desc: 'El más rápido y económico. Ideal para respuestas en tiempo real, soporte básico y flujos de alta frecuencia. Latencia ultra baja.', tags: ['Rápido', 'Económico', 'Alta frecuencia'], recomendado: true  },
        { id: 'claude-sonnet-4-6', emoji: '🎯', nombre: 'Claude Sonnet 4.6', desc: 'El equilibrio perfecto entre calidad y velocidad. Excelente para calificación de leads, análisis de conversaciones y tareas complejas.',   tags: ['Equilibrado', 'Calificación', 'Análisis'], recomendado: false },
        { id: 'claude-opus-4-7',   emoji: '🧠', nombre: 'Claude Opus 4.7',   desc: 'Máxima inteligencia. Para tareas que requieren razonamiento profundo, redacción avanzada o análisis estratégico.',                            tags: ['Máxima calidad', 'Razonamiento', 'Estratégico'], recomendado: false },
      ],
    };
  },
  computed: {
    clienteId() {
      return this.$store.getters.clienteId || this.$storage.get('user')?.clienteId || null;
    },
    webhookUrl() {
      const base = window.location.hostname === 'localhost'
        ? 'https://tu-dominio.com'
        : `${window.location.protocol}//${window.location.host}`;
      return `${base}/whatsapp/webhook`;
    },
    webhookUrlRS() {
      const base = window.location.hostname === 'localhost'
        ? 'https://tu-dominio.com'
        : `${window.location.protocol}//${window.location.host}`;
      return `${base}/red-social/webhook`;
    },
    plataformasMeta() {
      return {
        facebook: {
          title: 'Facebook',
          desc: 'Conecta tu página de Facebook para gestionar mensajes y comentarios con IA',
          icon: SVGS.facebook,
          pageIdLabel: 'Page ID',
          pageIdPlaceholder: '123456789012345',
          namePlaceholder: 'Mi Página de Facebook',
          hasTest: true,
          color: '#1877F2',
        },
        instagram: {
          title: 'Instagram Business',
          desc: 'Conecta tu cuenta de Instagram Business para DMs y comentarios con IA',
          icon: SVGS.instagram,
          pageIdLabel: 'Business Account ID',
          pageIdPlaceholder: '987654321098765',
          namePlaceholder: '@mi_empresa',
          hasTest: true,
          color: '#E1306C',
        },
        tiktok: {
          title: 'TikTok Business',
          desc: 'Registra tu cuenta de TikTok Business para gestión de comentarios',
          icon: SVGS.tiktok,
          pageIdLabel: 'Open ID / Account ID',
          pageIdPlaceholder: '7123456789012345678',
          namePlaceholder: '@mi_empresa_tiktok',
          hasTest: false,
          color: '#010101',
        },
        linkedin: {
          title: 'LinkedIn Company',
          desc: 'Conecta tu página de empresa de LinkedIn para gestión de mensajes',
          icon: SVGS.linkedin,
          pageIdLabel: 'Organization ID',
          pageIdPlaceholder: '12345678',
          namePlaceholder: 'Mi Empresa LinkedIn',
          hasTest: false,
          color: '#0A66C2',
        },
      };
    },
  },
  watch: {
    seccion(val) {
      if (['facebook', 'instagram', 'tiktok', 'linkedin'].includes(val)) {
        this.rsState.cuentas = [];
        this.rsState.testResult = null;
        this.rsForm.visible = false;
        this.cargarCuentasRS();
      }
    },
  },
  async mounted() {
    await Promise.all([this.cargarConfig(), this.cargarAgentes()]);
    await this.cargarConfigWa();
    await this.actualizarEstadoWa();
  },
  methods: {
    async cargarConfig() {
      if (!this.clienteId) return;
      try {
        const configs = await this.$service.list(`clientes/${this.clienteId}/configuracion`);
        if (!configs) return;
        const apiConf   = configs.find(c => c.clave === 'ANTHROPIC_API_KEY');
        const modelConf = configs.find(c => c.clave === 'ANTHROPIC_DEFAULT_MODEL');
        if (apiConf   && apiConf.valor   && !apiConf.valor.includes('•'))  this.apiKey = apiConf.valor;
        if (modelConf && modelConf.valor) this.modelo = modelConf.valor;
      } catch (_e) { /* silently ignore load errors */ }
    },
    async cargarAgentes() {
      try {
        this.agentes = (await this.$service.list('agentes')) || [];
      } catch (_e) { /* silently ignore */ }
    },
    async cargarConfigWa() {
      try {
        const cfg = await this.$service.get('whatsapp/config');
        if (!cfg) return;
        this.waForm.phoneNumberId = cfg.phoneNumberId || '';
        this.waForm.wabaId        = cfg.wabaId        || '';
        this.waForm.verifyToken   = cfg.verifyToken   || 'ide_ia_verify_token';
        this.waForm.agenteId      = cfg.agenteId      || '';
        this.waForm.enabled       = cfg.enabled       || false;
      } catch (_e) { /* silently ignore */ }
    },
    async actualizarEstadoWa() {
      try {
        this.waStatus = await this.$service.get('whatsapp/status') || { valida: false };
      } catch (_e) { /* silently ignore */ }
    },

    // ── Anthropic ──
    async verificarKey() {
      if (!this.apiKey.trim()) { this.resultadoVerif = { ok: false, msg: 'Ingresa tu API Key de Anthropic.' }; return; }
      this.verificando = true;
      this.resultadoVerif = null;
      try {
        const result = await this.$service.post('configuracion/verificar-api-key', { apiKey: this.apiKey, modelo: this.modelo });
        this.resultadoVerif = { ok: result?.valida || false, msg: result?.mensaje || 'Error' };
      } catch (e) {
        this.resultadoVerif = { ok: false, msg: e?.mensaje || 'Error al verificar' };
      } finally { this.verificando = false; }
    },
    async guardarApiKey() {
      if (!this.clienteId) return;
      this.guardando = true;
      try {
        await Promise.all([
          this.$service.post(`clientes/${this.clienteId}/configuracion`, { clave: 'ANTHROPIC_API_KEY',       valor: this.apiKey, esSecreto: true, descripcion: 'API Key de Anthropic' }),
          this.$service.post(`clientes/${this.clienteId}/configuracion`, { clave: 'ANTHROPIC_DEFAULT_MODEL', valor: this.modelo,                  descripcion: 'Modelo de Claude por defecto' }),
        ]);
        this.$message.success('Configuración guardada correctamente');
      } catch (e) {
        this.$message.error(e?.mensaje || 'Error al guardar');
      } finally { this.guardando = false; }
    },
    async guardarCanales() {
      if (!this.clienteId) return;
      this.guardando = true;
      try {
        for (const c of this.canales) {
          await this.$service.post(`clientes/${this.clienteId}/configuracion`, { clave: `CANAL_${c.id.toUpperCase()}`, valor: String(c.activo), descripcion: `Auto-respuesta canal ${c.label}` });
        }
        this.$message.success('Canales actualizados');
      } catch (e) {
        this.$message.error(e?.mensaje || 'Error al guardar canales');
      } finally { this.guardando = false; }
    },

    // ── WhatsApp ──
    async testConexionWa() {
      if (!this.waForm.accessToken || !this.waForm.phoneNumberId) return;
      this.waTestando = true;
      this.waTestResult = null;
      try {
        this.waTestResult = await this.$service.post('whatsapp/test-connection', {
          accessToken: this.waForm.accessToken,
          phoneNumberId: this.waForm.phoneNumberId,
        });
      } catch (e) {
        this.waTestResult = { valida: false, mensaje: e?.mensaje || 'Error al conectar' };
      } finally { this.waTestando = false; }
    },
    async guardarWa() {
      this.guardando = true;
      try {
        await this.$service.post('whatsapp/config', {
          accessToken:   this.waForm.accessToken   || undefined,
          phoneNumberId: this.waForm.phoneNumberId,
          wabaId:        this.waForm.wabaId,
          verifyToken:   this.waForm.verifyToken,
          agenteId:      this.waForm.agenteId,
          enabled:       this.waForm.enabled,
        });
        this.$message.success('Configuración WhatsApp guardada');
        await this.actualizarEstadoWa();
      } catch (e) {
        this.$message.error(e?.mensaje || 'Error al guardar');
      } finally { this.guardando = false; }
    },
    copiar(texto) {
      navigator.clipboard?.writeText(texto).then(() => this.$message.success('Copiado al portapapeles'));
    },

    // ── Redes Sociales ──
    async cargarCuentasRS() {
      if (!this.clienteId) return;
      this.rsState.cargando = true;
      try {
        this.rsState.cuentas = (await this.$service.list(
          `clientes/${this.clienteId}/red-social/cuentas`,
          { plataforma: this.seccion },
        )) || [];
      } catch (_e) { /* silently ignore */ }
      finally { this.rsState.cargando = false; }
    },

    abrirFormRS() {
      this.rsForm = { visible: true, editandoId: null, nombre: '', pageId: '', accessToken: '', showToken: false, appSecret: '', verifyToken: 'ide_ia_meta_token', agenteId: '', enabled: true };
      this.rsState.testResult = null;
    },

    editarCuentaRS(cuenta) {
      this.rsForm = {
        visible: true,
        editandoId: cuenta.id,
        nombre: cuenta.nombre,
        pageId: cuenta.pageId,
        accessToken: '',
        showToken: false,
        appSecret: '',
        verifyToken: cuenta.verifyToken || 'ide_ia_meta_token',
        agenteId: cuenta.agenteId || '',
        enabled: cuenta.enabled !== false,
      };
      this.rsState.testResult = null;
    },

    async guardarCuentaRS() {
      if (!this.clienteId) return;
      if (!this.rsForm.nombre.trim() || !this.rsForm.pageId.trim()) {
        this.$message.error('Nombre y ID son obligatorios');
        return;
      }
      this.rsState.guardando = true;
      try {
        const body = {
          plataforma: this.seccion,
          nombre: this.rsForm.nombre,
          pageId: this.rsForm.pageId,
          accessToken: this.rsForm.accessToken || undefined,
          appSecret: this.rsForm.appSecret || undefined,
          verifyToken: this.rsForm.verifyToken,
          agenteId: this.rsForm.agenteId || undefined,
          enabled: this.rsForm.enabled,
        };
        if (this.rsForm.editandoId) {
          await this.$service.put(`clientes/${this.clienteId}/red-social/cuentas/${this.rsForm.editandoId}`, body);
          this.$message.success('Cuenta actualizada correctamente');
        } else {
          await this.$service.post(`clientes/${this.clienteId}/red-social/cuentas`, body);
          this.$message.success('Cuenta conectada correctamente');
        }
        this.rsForm.visible = false;
        this.rsState.testResult = null;
        await this.cargarCuentasRS();
      } catch (e) {
        this.$message.error(e?.mensaje || 'Error al guardar cuenta');
      } finally { this.rsState.guardando = false; }
    },

    async eliminarCuentaRS(id) {
      this.$confirm('¿Eliminar esta cuenta de red social?', async () => {
        try {
          await this.$service.delete(`clientes/${this.clienteId}/red-social/cuentas`, id);
          this.$message.success('Cuenta eliminada');
          await this.cargarCuentasRS();
        } catch (e) {
          this.$message.error('Error al eliminar cuenta');
        }
      });
    },

    async testConexionRS() {
      if (!this.rsForm.accessToken || !this.rsForm.pageId) return;
      this.rsState.testing = true;
      this.rsState.testResult = null;
      try {
        this.rsState.testResult = await this.$service.post(
          `clientes/${this.clienteId}/red-social/test-conexion`,
          { accessToken: this.rsForm.accessToken, pageId: this.rsForm.pageId, plataforma: this.seccion },
        );
      } catch (e) {
        this.rsState.testResult = { valida: false, mensaje: e?.mensaje || 'Error al conectar' };
      } finally { this.rsState.testing = false; }
    },
  },
};
</script>

<style scoped>
.cfg-info-card  { background: #1a0f0a; border: 1px solid #c9644244; border-radius: 8px; padding: 14px; margin-bottom: 16px; }
.cfg-step-num   { width: 18px; height: 18px; border-radius: 50%; background: #c9644233; color: #e8956d; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
.cfg-form-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 4px; }
.cfg-result     { padding: 10px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; line-height: 1.5; margin-top: 12px; }
.cfg-result--ok  { background: #22c55e18; border: 1px solid #22c55e33; color: #22c55e; }
.cfg-result--err { background: #ef444418; border: 1px solid #ef444433; color: #ef4444; }
.cfg-eye        { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 14px; padding: 4px; }
.cfg-copy-btn   { padding: 4px 10px; border-radius: 6px; background: #6366f122; border: 1px solid #6366f133; color: #818cf8; font-size: 11px; font-weight: 600; cursor: pointer; font-family: inherit; white-space: nowrap; }
.cfg-copy-btn:hover { background: #6366f133; }

/* Shared button/badge classes (used in social network section) */
.ide-cl-btn {
  width: 28px; height: 28px; border-radius: 6px;
  background: #0f172a; border: 1px solid #1e3a5f44;
  color: #64748b; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.ide-cl-btn:hover { background: #1e293b; color: #94a3b8; }
.ide-cl-btn--danger:hover { background: #ef444411; border-color: #ef444433; color: #ef4444; }
.ide-cl-btn-sec {
  padding: 7px 16px; border-radius: 8px;
  background: none; border: 1px solid #334155;
  color: #64748b; font-size: 12px; font-weight: 600;
  cursor: pointer; font-family: inherit;
}
.ide-cl-btn-sec:hover { border-color: #475569; color: #94a3b8; }
.ide-cl-status {
  font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 999px;
}
.ide-cl-status--on  { background: #22c55e22; color: #22c55e; }
.ide-cl-status--off { background: #ef444422; color: #ef4444; }

/* Social network cuentas */
.rs-cuenta-card {
  display: flex; align-items: center; gap: 12px;
  background: #1e293b; border: 1px solid #1e3a5f33; border-radius: 10px; padding: 12px 14px;
  transition: border-color 0.15s;
}
.rs-cuenta-card:hover { border-color: #6366f133; }
.rs-cuenta-ico {
  width: 34px; height: 34px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; font-size: 16px;
}
</style>

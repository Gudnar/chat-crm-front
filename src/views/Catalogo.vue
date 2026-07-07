<template>
  <div class="ide-page">

    <!-- Header -->
    <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
      <div>
        <h2 style="font-size:18px; font-weight:800; color:#f1f5f9; letter-spacing:-0.3px; margin-bottom:4px;">Catálogo de Productos</h2>
        <p style="font-size:12px; color:#64748b;">Gestiona los productos que el agente IA usa para cotizar y responder consultas de clientes</p>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn-add" @click="abrirForm(null)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Agregar
        </button>
        <button class="btn-add" @click="exportarExcel" style="background:#22c55e;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exportar
        </button>
        <button class="btn-add" @click="abrirDialogImportar" style="background:#f59e0b;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 14 12 9 7 14"/><line x1="12" y1="9" x2="12" y2="21"/></svg>
          Importar
        </button>
      </div>
    </div>

    <!-- Stats row -->
    <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:20px; max-width:480px;">
      <div class="ide-ia-card" style="padding:12px 14px; text-align:center;">
        <div style="font-size:22px; font-weight:900; color:#f1f5f9; line-height:1;">{{ total }}</div>
        <div style="font-size:10px; color:#64748b; margin-top:3px;">Total</div>
      </div>
      <div class="ide-ia-card" style="padding:12px 14px; text-align:center;">
        <div style="font-size:22px; font-weight:900; color:#22c55e; line-height:1;">{{ activos }}</div>
        <div style="font-size:10px; color:#64748b; margin-top:3px;">Activos</div>
      </div>
      <div class="ide-ia-card" style="padding:12px 14px; text-align:center;">
        <div style="font-size:22px; font-weight:900; color:#818cf8; line-height:1;">{{ categorias.length }}</div>
        <div style="font-size:10px; color:#64748b; margin-top:3px;">Categorías</div>
      </div>
    </div>

    <!-- Filters -->
    <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px; flex-wrap:wrap;">
      <input
        v-model="busqueda"
        class="ide-input"
        placeholder="Buscar por nombre, marca, modelo…"
        style="width:260px; padding:8px 12px; font-size:12px;"
        @input="cargarDebounce"
      />
      <select v-model="categoriaFiltro" class="ide-select" style="width:180px; padding:8px 12px; font-size:12px;" @change="pagina = 1; cargar()">
        <option value="">Todas las categorías</option>
        <option v-for="c in categorias" :key="c" :value="c">{{ c }}</option>
      </select>
      <button
        v-if="busqueda || categoriaFiltro"
        @click="busqueda = ''; categoriaFiltro = ''; pagina = 1; cargar()"
        style="background:none; border:1px solid #334155; border-radius:8px; color:#64748b; padding:7px 12px; font-size:12px; cursor:pointer; font-family:inherit;"
      >
        Limpiar
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" style="display:flex; justify-content:center; padding:56px;">
      <v-progress-circular indeterminate color="primary" size="36" />
    </div>

    <!-- Empty -->
    <div v-else-if="!productos.length" class="ide-ia-card" style="text-align:center; padding:56px; color:#475569;">
      <div style="font-size:36px; margin-bottom:12px;">📦</div>
      <div style="font-size:14px; font-weight:700; color:#94a3b8; margin-bottom:6px;">
        {{ busqueda || categoriaFiltro ? 'Sin resultados' : 'Sin productos' }}
      </div>
      <div style="font-size:12px;">
        {{ busqueda || categoriaFiltro ? 'Intenta con otros filtros' : 'Agrega tu primer producto para que el agente pueda cotizarlo y enviarlo al cliente' }}
      </div>
      <button v-if="!busqueda && !categoriaFiltro" class="btn-add" @click="abrirForm(null)" style="margin:16px auto 0;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Agregar producto
      </button>
    </div>

    <!-- Products table -->
    <div v-else class="ide-ia-card" style="overflow-x:auto; padding:0;">
      <table class="cat-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Categoría</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Oferta</th>
            <th>Stock</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in productos" :key="p.id" :style="{ opacity: p.activo ? 1 : 0.55 }">
            <td style="font-weight:600; color:#e2e8f0;">{{ p.nombre }}</td>
            <td style="color:#94a3b8;">{{ p.marca || '—' }}</td>
            <td style="color:#94a3b8;">{{ p.modelo || '—' }}</td>
            <td>
              <span v-if="p.categoria" style="background:#6366f122; color:#818cf8; padding:2px 8px; border-radius:4px; font-size:11px;">{{ p.categoria }}</span>
              <span v-else style="color:#475569;">—</span>
            </td>
            <td style="color:#94a3b8; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" :title="p.descripcion">{{ p.descripcion || '—' }}</td>
            <td style="color:#e2e8f0; font-weight:600;">{{ p.moneda }} {{ Number(p.precio).toFixed(2) }}</td>
            <td>
              <span v-if="p.precioOferta" style="color:#22c55e; font-weight:600;">{{ p.moneda }} {{ Number(p.precioOferta).toFixed(2) }}</span>
              <span v-else style="color:#475569;">—</span>
            </td>
            <td :style="{ color: p.stock > 0 ? '#22c55e' : '#ef4444', fontWeight: '600' }">
              {{ p.stock != null ? (p.stock > 0 ? p.stock + ' uds.' : 'Agotado') : '—' }}
            </td>
            <td>
              <span v-if="p.activo" style="background:#22c55e33; color:#22c55e; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:600;">Activo</span>
              <span v-else style="background:#ef444433; color:#ef4444; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:600;">Inactivo</span>
            </td>
            <td style="text-align:center;">
              <button @click="abrirForm(p)" style="background:none; border:none; cursor:pointer; color:#818cf8; padding:4px 8px; font-size:12px; font-weight:600; font-family:inherit;" title="Editar">
                ✏️
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginación -->
      <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 16px; border-top:1px solid #1e3a5f44; flex-wrap:wrap;">
        <div style="font-size:11px; color:#64748b;">
          Mostrando {{ productos.length }} de {{ total }} productos
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <button class="cat-page-btn" :disabled="pagina <= 1" @click="irPagina(1)" title="Primera">«</button>
          <button class="cat-page-btn" :disabled="pagina <= 1" @click="irPagina(pagina - 1)">‹ Anterior</button>
          <span style="font-size:11px; color:#94a3b8; padding:0 8px; font-weight:700;">
            Página {{ pagina }} de {{ totalPaginas }}
          </span>
          <button class="cat-page-btn" :disabled="pagina >= totalPaginas" @click="irPagina(pagina + 1)">Siguiente ›</button>
          <button class="cat-page-btn" :disabled="pagina >= totalPaginas" @click="irPagina(totalPaginas)" title="Última">»</button>
          <select v-model.number="limite" class="ide-select" style="width:auto; padding:5px 8px; font-size:11px; margin-left:8px;" @change="pagina = 1; cargar()">
            <option :value="25">25 / pág.</option>
            <option :value="50">50 / pág.</option>
            <option :value="100">100 / pág.</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Modal: Create / Edit -->
    <div v-if="dialogForm" class="cat-overlay" @click.self="dialogForm = false">
      <div class="cat-modal">
        <!-- Header -->
        <div style="display:flex; align-items:center; justify-content:space-between; padding:18px 22px 14px; border-bottom:1px solid #334155; flex-shrink:0;">
          <span style="font-size:15px; font-weight:700; color:#f1f5f9;">{{ editandoProducto ? 'Editar producto' : 'Nuevo producto' }}</span>
          <div style="display:flex; align-items:center; gap:10px;">
            <button v-if="editandoProducto" @click="confirmarEliminar(editandoProducto)" style="background:none; border:none; cursor:pointer; color:#ef4444; font-size:12px; font-family:inherit; display:flex; align-items:center; gap:4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
              Eliminar
            </button>
            <button @click="dialogForm = false" style="background:none; border:none; cursor:pointer; color:#475569; padding:4px; border-radius:4px; line-height:0; display:flex;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        <!-- Body -->
        <div style="overflow-y:auto; padding:18px 22px; flex:1;">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px;">
            <div class="ide-field" style="grid-column:span 2;">
              <label>Nombre del producto *</label>
              <input v-model="form.nombre" class="ide-input" placeholder="Ej: Laptop HP Pavilion 15" />
            </div>
            <div class="ide-field">
              <label>Marca</label>
              <input v-model="form.marca" class="ide-input" placeholder="HP, Samsung, Apple…" />
            </div>
            <div class="ide-field">
              <label>Modelo</label>
              <input v-model="form.modelo" class="ide-input" placeholder="Pavilion 15, S24, Pro Max…" />
            </div>
            <div class="ide-field">
              <label>Categoría</label>
              <input v-model="form.categoria" class="ide-input" placeholder="Laptops, Celulares, Ropa…" list="cat-form" />
              <datalist id="cat-form">
                <option v-for="c in categorias" :key="c" :value="c" />
              </datalist>
            </div>
            <div class="ide-field">
              <label>Moneda</label>
              <select v-model="form.moneda" class="ide-select">
                <option value="PEN">PEN — Sol peruano</option>
                <option value="USD">USD — Dólar</option>
                <option value="EUR">EUR — Euro</option>
              </select>
            </div>
            <div class="ide-field">
              <label>Precio *</label>
              <input v-model.number="form.precio" type="number" min="0" step="0.01" class="ide-input" placeholder="0.00" />
            </div>
            <div class="ide-field">
              <label>Precio oferta <span style="color:#475569; font-size:10px;">(opcional)</span></label>
              <input v-model.number="form.precioOferta" type="number" min="0" step="0.01" class="ide-input" placeholder="Vacío si no hay oferta" />
            </div>
            <div class="ide-field">
              <label>Stock <span style="color:#475569; font-size:10px;">(opcional)</span></label>
              <input v-model.number="form.stock" type="number" min="0" class="ide-input" placeholder="Vacío = sin seguimiento" />
            </div>
            <div class="ide-field" style="grid-column:span 2;">
              <label>Descripción</label>
              <textarea v-model="form.descripcion" class="ide-textarea" rows="3" placeholder="Características principales, usos, beneficios…"></textarea>
            </div>
            <div class="ide-field" style="grid-column:span 2; flex-direction:row; align-items:center; gap:10px;">
              <div class="ide-toggle" :class="{ 'ide-toggle--on': form.activo }" @click="form.activo = !form.activo"><div></div></div>
              <span style="font-size:12px;" :style="{ color: form.activo ? '#22c55e' : '#64748b' }">{{ form.activo ? 'Producto activo' : 'Producto inactivo' }}</span>
            </div>
          </div>

          <!-- Images (only once product exists) -->
          <div v-if="editandoProducto" style="border-top:1px solid #334155; padding-top:14px; margin-top:4px;">
            <div style="font-size:12px; font-weight:700; color:#e2e8f0; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Imágenes ({{ (editandoProducto.imagenes || []).length }})
            </div>
            <div v-if="editandoProducto.imagenes && editandoProducto.imagenes.length" style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px;">
              <div v-for="img in editandoProducto.imagenes" :key="img" style="position:relative; width:72px; height:72px; border-radius:8px; overflow:hidden; border:1px solid #334155; flex-shrink:0;">
                <img :src="imgUrl(img)" style="width:100%; height:100%; object-fit:cover;" @error="e => e.target.style.display='none'" />
                <button @click.stop="eliminarImagen(img)" style="position:absolute; top:3px; right:3px; background:#00000099; border:none; cursor:pointer; border-radius:4px; padding:3px; color:#fff; line-height:0; display:flex; align-items:center; justify-content:center;">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            <label class="img-upload-zone" :class="{ 'img-upload-zone--drag': dragging }" @dragover.prevent="dragging = true" @dragleave="dragging = false" @drop.prevent="onDrop">
              <input type="file" multiple accept="image/*" style="display:none;" @change="onFileChange" />
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.5" style="margin-bottom:4px;"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span style="font-size:12px; color:#64748b;">Arrastra o <span style="color:#818cf8;">selecciona imágenes</span></span>
              <span style="font-size:10px; color:#475569; margin-top:2px;">JPG, PNG, WebP · Máx 5 MB</span>
            </label>
            <div v-if="uploadingImages" style="display:flex; align-items:center; gap:8px; margin-top:8px; font-size:11px; color:#64748b;">
              <v-progress-circular indeterminate size="14" width="2" color="primary" /> Subiendo…
            </div>
          </div>
          <div v-else style="margin-top:8px; padding:10px; background:#0f172a; border-radius:8px; font-size:11px; color:#475569; text-align:center;">
            Guarda el producto primero para luego subir imágenes
          </div>
        </div>

        <!-- Footer -->
        <div style="display:flex; justify-content:flex-end; gap:8px; padding:12px 22px 18px; border-top:1px solid #334155; flex-shrink:0;">
          <button @click="dialogForm = false" style="background:none; border:1px solid #334155; border-radius:8px; color:#64748b; padding:8px 16px; font-size:12px; cursor:pointer; font-family:inherit;">Cancelar</button>
          <button @click="guardar" :disabled="saving" style="background:#6366f1; color:#fff; border:none; border-radius:8px; padding:8px 18px; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; display:flex; align-items:center; gap:6px;">
            <v-progress-circular v-if="saving" indeterminate size="14" width="2" color="white" />
            {{ editandoProducto ? 'Guardar cambios' : 'Crear producto' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Delete confirm -->
    <div v-if="dialogEliminar" class="cat-overlay" @click.self="dialogEliminar = false">
      <div style="background:#1e293b; border:1px solid #334155; border-radius:12px; width:420px; max-width:95%; padding:24px;">
        <div style="font-size:15px; font-weight:700; color:#f1f5f9; margin-bottom:8px;">Eliminar producto</div>
        <div style="font-size:12px; color:#94a3b8; line-height:1.6; margin-bottom:20px;">
          ¿Estás seguro de que deseas eliminar
          <strong style="color:#f1f5f9;">{{ eliminandoProducto ? eliminandoProducto.nombre : '' }}</strong>?
          Se eliminarán también todas sus imágenes.
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button @click="dialogEliminar = false" style="background:none; border:1px solid #334155; border-radius:8px; color:#64748b; padding:8px 14px; font-size:12px; cursor:pointer; font-family:inherit;">Cancelar</button>
          <button @click="eliminar" :disabled="deleting" style="background:#ef4444; color:#fff; border:none; border-radius:8px; padding:8px 14px; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; display:flex; align-items:center; gap:6px;">
            <v-progress-circular v-if="deleting" indeterminate size="14" width="2" color="white" />
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Diálogo de importación -->
    <div v-if="dialogImportar" class="sop-overlay" @click.self="dialogImportar = false">
      <div class="cat-dialog">
        <div class="cat-dialog-header">
          <h3>Importar Excel</h3>
          <button @click="dialogImportar = false" style="background:none; border:none; font-size:20px; cursor:pointer;">×</button>
        </div>
        <div class="cat-dialog-content">
          <p style="margin-bottom:16px; font-size:14px; color:#999;">Selecciona un archivo Excel: lista de precios (Marca, Modelo, Versión, en Mano…) o formato clásico (Nombre y Precio)</p>
          <label style="display:flex; align-items:center; justify-content:center; gap:8px; background:#f59e0b; color:#fff; border-radius:8px; padding:10px 16px; font-size:14px; font-weight:600; cursor:pointer; font-family:inherit; width:100%; margin-bottom:12px; box-sizing:border-box;">
            <input ref="fileInput" type="file" accept=".xlsx,.xls" style="display:none;" @change="handleFileImport" />
            <span v-if="importando" class="cat-spinner-sm"></span>
            {{ importando ? 'Importando…' : 'Seleccionar archivo' }}
          </label>
        </div>
        <div class="cat-dialog-actions">
          <button @click="dialogImportar = false" style="background:#666; color:#fff; border:none; border-radius:8px; padding:8px 16px; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit;">
            Cancelar
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'Catalogo',
  data() {
    return {
      productos: [],
      loading: false,
      saving: false,
      deleting: false,
      uploadingImages: false,
      dragging: false,
      busqueda: '',
      categoriaFiltro: '',
      pagina: 1,
      totalPaginas: 1,
      total: 0,
      activos: 0,
      limite: 25,
      categorias: [],
      dialogForm: false,
      dialogEliminar: false,
      editandoProducto: null,
      eliminandoProducto: null,
      debounceTimer: null,
      form: {
        nombre: '', marca: '', modelo: '', categoria: '',
        descripcion: '', precio: null, precioOferta: null,
        moneda: 'PEN', stock: null, activo: true,
      },
      dialogImportar: false,
      importando: false,
    };
  },
  async mounted() {
    await this.cargar();
  },
  methods: {
    async cargar() {
      this.loading = true;
      try {
        const data = await this.$service.list('productos', {
          q: this.busqueda || undefined,
          categoria: this.categoriaFiltro || undefined,
          pagina: this.pagina,
          limite: this.limite,
        });
        if (Array.isArray(data)) {
          // Compatibilidad con respuesta antigua (backend sin reiniciar)
          this.productos = data;
          this.total = data.length;
          this.activos = data.filter(p => p.activo).length;
          this.totalPaginas = 1;
          this.categorias = [...new Set(data.filter(p => p.categoria).map(p => p.categoria))].sort();
        } else {
          this.productos = data?.items || [];
          this.total = data?.total || 0;
          this.activos = data?.activos || 0;
          this.pagina = data?.pagina || 1;
          this.totalPaginas = data?.totalPaginas || 1;
          this.categorias = data?.categorias || [];
        }
      } finally {
        this.loading = false;
      }
    },
    irPagina(p) {
      if (p < 1 || p > this.totalPaginas || p === this.pagina) return;
      this.pagina = p;
      this.cargar();
    },
    cargarDebounce() {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => { this.pagina = 1; this.cargar(); }, 400);
    },
    imgUrl(filename) {
      const base = (process.env.VUE_APP_BASE_SERVER || 'http://localhost:3001/api/').replace(/\/api\/?$/, '');
      return `${base}/uploads/${filename}`;
    },
    abrirForm(producto) {
      this.editandoProducto = producto || null;
      this.form = producto
        ? {
            nombre: producto.nombre || '', marca: producto.marca || '', modelo: producto.modelo || '',
            categoria: producto.categoria || '', descripcion: producto.descripcion || '',
            precio: producto.precio, precioOferta: producto.precioOferta || null,
            moneda: producto.moneda || 'PEN', stock: producto.stock ?? null, activo: producto.activo,
          }
        : { nombre: '', marca: '', modelo: '', categoria: '', descripcion: '', precio: null, precioOferta: null, moneda: 'PEN', stock: null, activo: true };
      this.dialogForm = true;
    },
    async guardar() {
      if (!this.form.nombre) { this.$message.error('El nombre es obligatorio'); return; }
      if (this.form.precio == null || this.form.precio === '') { this.$message.error('El precio es obligatorio'); return; }
      this.saving = true;
      try {
        if (this.editandoProducto) {
          const updated = await this.$service.put(`productos/${this.editandoProducto.id}`, this.form);
          const idx = this.productos.findIndex(p => p.id === this.editandoProducto.id);
          if (idx !== -1) {
            const merged = Object.assign({}, this.productos[idx], updated);
            this.productos.splice(idx, 1, merged);
            this.editandoProducto = merged;
          }
          this.$message.success('Producto actualizado');
        } else {
          const created = await this.$service.post('productos', this.form);
          this.productos.unshift(created);
          this.editandoProducto = this.productos[0];
          this.$message.success('Producto creado — ahora puedes subir imágenes');
        }
      } catch (e) {
        this.$message.error('Error al guardar');
      } finally {
        this.saving = false;
      }
    },
    confirmarEliminar(producto) {
      this.eliminandoProducto = producto;
      this.dialogEliminar = true;
    },
    async eliminar() {
      this.deleting = true;
      try {
        await this.$service.delete(`productos/${this.eliminandoProducto.id}`);
        this.productos = this.productos.filter(p => p.id !== this.eliminandoProducto.id);
        this.$message.success('Producto eliminado');
        this.dialogEliminar = false;
        this.dialogForm = false;
        this.editandoProducto = null;
      } catch (e) {
        this.$message.error('Error al eliminar');
      } finally {
        this.deleting = false;
      }
    },
    onFileChange(e) {
      this.subirImagenes(e.target.files);
      e.target.value = '';
    },
    onDrop(e) {
      this.dragging = false;
      this.subirImagenes(e.dataTransfer.files);
    },
    async subirImagenes(files) {
      if (!files || !files.length || !this.editandoProducto) return;
      this.uploadingImages = true;
      try {
        const formData = new FormData();
        Array.from(files).forEach(f => formData.append('imagenes', f));
        const res = await this.$http.post(
          `${this.$baseServer}productos/${this.editandoProducto.id}/imagenes`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } },
        );
        const updated = res.data && res.data.datos;
        if (updated) {
          const idx = this.productos.findIndex(p => p.id === this.editandoProducto.id);
          if (idx !== -1) {
            const merged = Object.assign({}, this.productos[idx], updated);
            this.productos.splice(idx, 1, merged);
            this.editandoProducto = merged;
          }
          this.$message.success('Imagen(es) subida(s)');
        }
      } catch (e) {
        this.$message.error('Error al subir imágenes');
      } finally {
        this.uploadingImages = false;
      }
    },
    async eliminarImagen(filename) {
      try {
        const res = await this.$http.delete(
          `${this.$baseServer}productos/${this.editandoProducto.id}/imagenes`,
          { data: { filename } },
        );
        const updated = res.data && res.data.datos;
        if (updated) {
          const idx = this.productos.findIndex(p => p.id === this.editandoProducto.id);
          if (idx !== -1) {
            const merged = Object.assign({}, this.productos[idx], updated);
            this.productos.splice(idx, 1, merged);
            this.editandoProducto = merged;
          }
          this.$message.success('Imagen eliminada');
        }
      } catch (e) {
        this.$message.error('Error al eliminar imagen');
      }
    },
    abrirDialogImportar() {
      this.dialogImportar = true;
    },
    async handleFileImport(event) {
      const file = event.target.files?.[0];
      if (!file) return;

      this.importando = true;
      try {
        const formData = new FormData();
        formData.append('archivo', file);

        const response = await fetch(`${this.$baseServer}productos/importar/excel`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.$storage.get('token')}`,
          },
          body: formData,
        });

        const json = await response.json();
        const resultado = json.datos || json;

        if (resultado.creados > 0 || resultado.actualizados > 0) {
          this.$message.success(`${resultado.creados} creados, ${resultado.actualizados || 0} actualizados`);
          this.dialogImportar = false;
          this.cargar();
        } else if (!resultado.errores?.length) {
          this.$message.warning('No se encontraron productos en el archivo');
        }

        if (resultado.errores?.length > 0) {
          const erroresMsg = resultado.errores.slice(0, 3).join('\n');
          this.$message.warning(`${resultado.errores.length} errores: ${erroresMsg}${resultado.errores.length > 3 ? '...' : ''}`);
        }
      } catch (e) {
        this.$message.error('Error al importar archivo');
      } finally {
        this.importando = false;
        event.target.value = '';
      }
    },
    async exportarExcel() {
      try {
        const response = await fetch(`${this.$baseServer}productos/exportar/excel`, {
          headers: {
            'Authorization': `Bearer ${this.$storage.get('token')}`,
          },
        });

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `productos-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.$message.success('Excel exportado');
      } catch (e) {
        this.$message.error('Error al exportar Excel');
      }
    },
  },
};
</script>

<style scoped>
.cat-page-btn {
  background: transparent; border: 1px solid #334155; color: #94a3b8;
  border-radius: 6px; padding: 5px 10px; font-size: 11px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.cat-page-btn:hover:not(:disabled) { border-color: #6366f1; color: #e2e8f0; }
.cat-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.cat-spinner-sm {
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid #fff; border-top-color: transparent;
  animation: cat-spin 0.75s linear infinite;
  display: inline-block; flex-shrink: 0;
}
@keyframes cat-spin { to { transform: rotate(360deg); } }

.cat-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.65);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cat-modal {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  width: 680px;
  max-width: 95vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 9px 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  flex-shrink: 0;
  transition: background 0.15s;
}
.btn-add:hover { background: #4f46e5; }

.prod-card { transition: transform 0.15s, box-shadow 0.15s; }
.prod-card:hover { transform: translateY(-2px); box-shadow: 0 6px 24px #00000055; }

.img-upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border: 2px dashed #334155;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.img-upload-zone:hover,
.img-upload-zone--drag {
  border-color: #818cf8;
  background: #6366f108;
}

.sop-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.65);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cat-dialog {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  width: 420px;
  max-width: 95vw;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
}
.cat-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #334155;
}
.cat-dialog-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #f1f5f9;
}
.cat-dialog-content {
  padding: 20px;
  color: #cbd5e1;
  font-size: 14px;
}
.cat-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid #334155;
}

.cat-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.cat-table thead {
  background: #0f172a;
  border-bottom: 2px solid #1e3a5f;
  position: sticky;
  top: 0;
}

.cat-table thead tr th {
  text-align: left;
  padding: 12px 14px;
  font-weight: 700;
  color: #cbd5e1;
  white-space: nowrap;
}

.cat-table tbody tr {
  border-bottom: 1px solid #1e3a5f;
  transition: background 0.15s;
}

.cat-table tbody tr:hover {
  background: #0f1729;
}

.cat-table tbody tr td {
  padding: 12px 14px;
  vertical-align: middle;
}
</style>

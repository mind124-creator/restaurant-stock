let products = JSON.parse(localStorage.getItem("products")) || [];
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function saveData() {
    localStorage.setItem("products", JSON.stringify(products));
    localStorage.setItem("transactions", JSON.stringify(transactions));
}


// ===============================
// CHUYỂN TRANG
// ===============================

function showPage(page) {

    document.querySelectorAll(".page")
        .forEach(p => p.classList.add("hidden"));

    document.getElementById(page)
        .classList.remove("hidden");

    document.querySelectorAll(".menu")
        .forEach(btn => btn.classList.remove("active"));

    event.target.classList.add("active");

    refresh();
}


// ===============================
// THÊM HÀNG
// ===============================

function addProduct() {

    const code =
        document.getElementById("productCode").value.trim();

    const name =
        document.getElementById("productName").value.trim();

    const category =
        document.getElementById("productCategory").value;

    const unit =
        document.getElementById("productUnit").value.trim();

    const minimum =
        Number(document.getElementById("minimumStock").value);

    if (!code || !name || !unit) {
        alert("Vui lòng nhập đầy đủ thông tin hàng hóa.");
        return;
    }

    if (products.some(p => p.code === code)) {
        alert("Mã hàng đã tồn tại.");
        return;
    }

    products.push({

        id: Date.now(),

        code,

        name,

        category,

        unit,

        minimum,

        stock: 0

    });

    saveData();

    document.getElementById("productCode").value = "";
    document.getElementById("productName").value = "";
    document.getElementById("productUnit").value = "";
    document.getElementById("minimumStock").value = "";

    refresh();

    alert("Đã thêm hàng hóa.");
}


// ===============================
// NHẬP KHO
// ===============================

function importStock() {

    const supplier =
        document.getElementById("supplier").value.trim();

    const productId =
        Number(document.getElementById("importProduct").value);

    const quantity =
        Number(document.getElementById("importQuantity").value);

    const expiry =
        document.getElementById("importExpiry").value;

    if (!supplier || !productId || quantity <= 0) {
        alert("Vui lòng nhập đầy đủ thông tin.");
        return;
    }

    const product =
        products.find(p => p.id === productId);

    product.stock += quantity;

    transactions.push({

        id: Date.now(),

        type: "NHẬP",

        productId,

        quantity,

        detail: "NCC: " + supplier,

        expiry,

        date: new Date().toLocaleString("vi-VN")

    });

    saveData();

    document.getElementById("supplier").value = "";
    document.getElementById("importQuantity").value = "";
    document.getElementById("importExpiry").value = "";

    refresh();

    alert(
        `Đã nhập ${quantity} ${product.unit} ${product.name}`
    );
}


// ===============================
// XUẤT BẾP
// ===============================

function exportStock() {

    const productId =
        Number(document.getElementById("exportProduct").value);

    const quantity =
        Number(document.getElementById("exportQuantity").value);

    const receiver =
        document.getElementById("receiver").value.trim();

    if (!productId || quantity <= 0) {
        alert("Vui lòng nhập đầy đủ thông tin.");
        return;
    }

    const product =
        products.find(p => p.id === productId);

    if (quantity > product.stock) {

        alert(
            `Không đủ hàng!\nTồn hiện tại: ${product.stock} ${product.unit}`
        );

        return;
    }

    product.stock -= quantity;

    transactions.push({

        id: Date.now(),

        type: "XUẤT",

        productId,

        quantity,

        detail: "Bếp - Người nhận: " + receiver,

        date: new Date().toLocaleString("vi-VN")

    });

    saveData();

    document.getElementById("exportQuantity").value = "";
    document.getElementById("receiver").value = "";

    refresh();

    alert(
        `Đã xuất ${quantity} ${product.unit} ${product.name} cho bếp`
    );
}


// ===============================
// LOAD DANH SÁCH SẢN PHẨM
// ===============================

function loadProductOptions() {

    const importSelect =
        document.getElementById("importProduct");

    const exportSelect =
        document.getElementById("exportProduct");

    const options = products.map(p =>

        `<option value="${p.id}">
            ${p.name} (${p.stock} ${p.unit})
        </option>`

    ).join("");

    importSelect.innerHTML =
        `<option value="">-- Chọn hàng --</option>` + options;

    exportSelect.innerHTML =
        `<option value="">-- Chọn hàng --</option>` + options;
}


// ===============================
// BẢNG HÀNG HÓA
// ===============================

function renderProducts() {

    const table =
        document.getElementById("productTable");

    table.innerHTML = "";

    products.forEach(p => {

        const status =
            p.stock <= p.minimum
                ? `<span class="low">Sắp hết</span>`
                : `<span class="good">Đủ hàng</span>`;

        table.innerHTML += `

            <tr>

                <td>${p.code}</td>

                <td>${p.name}</td>

                <td>${p.category}</td>

                <td>${p.unit}</td>

                <td>${p.stock}</td>

                <td>
                    ${p.minimum}
                    ${status}
                </td>

            </tr>

        `;
    });
}


// ===============================
// DASHBOARD
// ===============================

function renderDashboard() {

    document.getElementById("totalProducts")
        .textContent = products.length;

    const today =
        new Date().toLocaleDateString("vi-VN");

    const imports =
        transactions.filter(t =>
            t.type === "NHẬP" &&
            t.date.startsWith(today)
        );

    const exports =
        transactions.filter(t =>
            t.type === "XUẤT" &&
            t.date.startsWith(today)
        );

    document.getElementById("todayImport")
        .textContent = imports.length;

    document.getElementById("todayExport")
        .textContent = exports.length;

    const low =
        products.filter(p =>
            p.stock <= p.minimum
        ).length;

    document.getElementById("lowStock")
        .textContent = low;

    const table =
        document.getElementById("dashboardStock");

    table.innerHTML = "";

    products.forEach(p => {

        const lowStock =
            p.stock <= p.minimum;

        table.innerHTML += `

            <tr>

                <td>${p.code}</td>

                <td>${p.name}</td>

                <td>${p.unit}</td>

                <td>${p.stock}</td>

                <td>
                    ${
                        lowStock
                        ? '<span class="low">⚠ Sắp hết</span>'
                        : '<span class="good">✓ Bình thường</span>'
                    }
                </td>

            </tr>

        `;
    });
}


// ===============================
// LỊCH SỬ
// ===============================

function renderHistory() {

    const table =
        document.getElementById("historyTable");

    table.innerHTML = "";

    transactions
        .slice()
        .reverse()
        .forEach(t => {

            const product =
                products.find(p =>
                    p.id === t.productId
                );

            if (!product) return;

            table.innerHTML += `

                <tr>

                    <td>${t.date}</td>

                    <td>
                        ${
                            t.type === "NHẬP"
                            ? "📥 NHẬP"
                            : "📤 XUẤT"
                        }
                    </td>

                    <td>${product.name}</td>

                    <td>
                        ${t.quantity} ${product.unit}
                    </td>

                    <td>${t.detail || ""}</td>

                </tr>

            `;
        });
}


// ===============================
// KIỂM KÊ
// ===============================

function renderInventory() {

    const table =
        document.getElementById("inventoryTable");

    table.innerHTML = "";

    products.forEach(p => {

        table.innerHTML += `

            <tr>

                <td>${p.name}</td>

                <td>
                    ${p.stock} ${p.unit}
                </td>

                <td>

                    <input
                        type="number"
                        min="0"
                        value="${p.stock}"
                        data-inventory="${p.id}"
                    >

                </td>

                <td id="diff-${p.id}">
                    0
                </td>

            </tr>

        `;

    });
}


function saveInventory() {

    products.forEach(p => {

        const input =
            document.querySelector(
                `[data-inventory="${p.id}"]`
            );

        const actual =
            Number(input.value);

        const difference =
            actual - p.stock;

        if (difference !== 0) {

            transactions.push({

                id: Date.now(),

                type: "ĐIỀU CHỈNH",

                productId: p.id,

                quantity: difference,

                detail:
                    `Kiểm kê: ${p.stock} → ${actual}`,

                date:
                    new Date().toLocaleString("vi-VN")

            });

            p.stock = actual;

        }

    });

    saveData();

    refresh();

    alert("Đã cập nhật kết quả kiểm kê.");
}


// ===============================
// REFRESH
// ===============================

function refresh() {

    loadProductOptions();

    renderProducts();

    renderDashboard();

    renderHistory();

    renderInventory();

}


// CHẠY LẦN ĐẦU
refresh();
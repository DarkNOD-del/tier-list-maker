const initialTiers = [{
    name: "S",
    color: "#FF3B30"
  },
  {
    name: "A",
    color: "#FF9500"
  },
  {
    name: "B",
    color: "#FFCC00"
  },
  {
    name: "C",
    color: "#34C759"
  },
  {
    name: "D",
    color: "#5AC8FA"
  }
];

let tierCount = 0;

const tiersContainer = document.getElementById("tiers");
const poolContainer = document.getElementById("pool");

function initializeSortable() {
  new Sortable(tiersContainer, {
    handle: '.tier-header',
    animation: 150,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    onEnd: updatePoolDisplay
  });

  new Sortable(poolContainer, {
    group: 'shared',
    animation: 150,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    filter: '.empty-pool',
    onEnd: updatePoolDisplay
  });
}

function addTier(name = "Новая категория", color = "#dddddd") {
  const tierDiv = document.createElement("div");
  tierDiv.className = "tier";

  const header = document.createElement("div");
  header.className = "tier-header";
  header.style.borderBottomColor = color;

  const colorBtn = document.createElement("button");
  colorBtn.className = "tier-color-btn";
  colorBtn.style.color = color;
  colorBtn.innerHTML = '<i class="fas fa-tint"></i>';

  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.value = color;
  colorInput.style.width = "0px";

  colorBtn.addEventListener("click", () => {
    colorInput.click();
  });

  colorInput.addEventListener("input", () => {
    colorBtn.style.color = colorInput.value;
    header.style.borderBottomColor = colorInput.value;
  });

  const nameInput = document.createElement("input");
  nameInput.className = "tier-name";
  nameInput.value = name;
  nameInput.placeholder = "Название категории";

  const delBtn = document.createElement("button");
  delBtn.className = "tier-delete";
  delBtn.innerHTML = '<i class="fas fa-times"></i>';
  delBtn.onclick = () => {
    tierDiv.remove();
  };

  header.appendChild(colorBtn);
  header.appendChild(colorInput);
  header.appendChild(nameInput);
  header.appendChild(delBtn);
  tierDiv.appendChild(header);

  const itemsDiv = document.createElement("div");
  itemsDiv.className = "tier-items";
  tierDiv.appendChild(itemsDiv);

  tiersContainer.appendChild(tierDiv);

  new Sortable(itemsDiv, {
    group: 'shared',
    animation: 150,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    onEnd: updatePoolDisplay
  });

  tierCount++;
  return tierDiv;
}

document.addEventListener('DOMContentLoaded', () => {
  initialTiers.forEach(tier => {
    addTier(tier.name, tier.color);
  });
  initializeSortable();
});

document.getElementById("add-tier-btn").onclick = () => {
  addTier("Новая категория", "#cccccc");
};

function updatePoolDisplay() {
  const pool = document.getElementById("pool");
  const emptyPool = pool.querySelector(".empty-pool");
  const hasItems = pool.querySelectorAll(".item").length > 0;

  if (hasItems) {
    if (emptyPool) emptyPool.style.display = "none";
  } else {
    if (emptyPool) emptyPool.style.display = "flex";
  }
}

function addRemoveHandler(itemDiv) {
  const btn = document.createElement("button");
  btn.className = "remove-item";
  btn.innerHTML = '<i class="fas fa-times"></i>';
  btn.onclick = (e) => {
    e.stopPropagation();
    itemDiv.remove();
    updatePoolDisplay();
  };
  itemDiv.appendChild(btn);
}

document.getElementById("image-input").onchange = function(event) {
  const files = event.target.files;
  for (const file of files) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.createElement("img");
      img.src = e.target.result;
      const itemDiv = document.createElement("div");
      itemDiv.className = "item";
      itemDiv.appendChild(img);
      addRemoveHandler(itemDiv);
      document.getElementById("pool").appendChild(itemDiv);
      updatePoolDisplay();
    };
    reader.readAsDataURL(file);
  }
  event.target.value = "";
};

function generateFileName() {
  const now = new Date();
  const time = `${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}`;
  const date = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth()+1).toString().padStart(2, '0')}.${now.getFullYear()}`;
  return `tierlist-${time}-${date}.json`;
}

function saveJSON() {
  const data = {
    name: document.getElementById("tierlist-name").value,
    tiers: [],
    pool: []
  };

  document.querySelectorAll(".tier").forEach(tierDiv => {
    const name = tierDiv.querySelector(".tier-name").value;
    const colorInput = tierDiv.querySelector('input[type="color"]');
    const color = colorInput ? colorInput.value : "#dddddd";
    const items = [];

    tierDiv.querySelectorAll(".tier-items img").forEach(img => {
      items.push(img.src);
    });

    data.tiers.push({
      name,
      color,
      items
    });
  });

  document.getElementById("pool").querySelectorAll("img").forEach(img => {
    data.pool.push(img.src);
  });

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", generateFileName());
  document.body.appendChild(dlAnchor);
  dlAnchor.click();
  document.body.removeChild(dlAnchor);
}

document.getElementById("save-json-btn").onclick = saveJSON;

document.getElementById("load-json-input").onchange = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const data = JSON.parse(e.target.result);

    tiersContainer.innerHTML = "";
    document.getElementById("pool").innerHTML = '<div class="empty-pool"><i class="far fa-folder-open"></i><p>Список картинок пуст!</p></div>';
    tierCount = 0;

    if (data.name) {
      document.getElementById("tierlist-name").value = data.name;
    }

    data.tiers.forEach(t => {
      const tierDiv = addTier(t.name, t.color);

      t.items.forEach(src => {
        const img = document.createElement("img");
        img.src = src;
        const itemDiv = document.createElement("div");
        itemDiv.className = "item";
        itemDiv.appendChild(img);
        addRemoveHandler(itemDiv);
        tierDiv.querySelector(".tier-items").appendChild(itemDiv);
      });
    });

    data.pool.forEach(src => {
      const img = document.createElement("img");
      img.src = src;
      const itemDiv = document.createElement("div");
      itemDiv.className = "item";
      itemDiv.appendChild(img);
      addRemoveHandler(itemDiv);
      document.getElementById("pool").appendChild(itemDiv);
    });

    updatePoolDisplay();
  };
  reader.readAsText(file);
  event.target.value = "";
};

document.getElementById("clear-all").onclick = function() {
  if (confirm("Вы уверены, что хотите удалить все категории и изображения?")) {
    tiersContainer.innerHTML = "";
    document.getElementById("pool").innerHTML = '<div class="empty-pool"><i class="far fa-folder-open"></i><p>Список картинок пуст!</p></div>';
    tierCount = 0;

    initialTiers.forEach(tier => {
      addTier(tier.name, tier.color);
    });
  }
};

updatePoolDisplay();
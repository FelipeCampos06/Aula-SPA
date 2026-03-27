function show(panel) {
    document.getElementById('loginPanel').style.display = panel === 'login' ? 'block' : 'none';
    document.getElementById('appPanel').style.display = panel === 'app' ? 'block' : 'none';
}

//funcao para mostrar as tarefas
function renderTasks(list) {
    const ul = document.getElementById('taskList');
    ul.innerHTML = '';

    // Ordem alfabética
    list.sort((a, b) => a.title.localeCompare(b.title));

    list.forEach(t => {
        const li = document.createElement('li');

        const title = document.createElement('span');
        title.className = 'task-title';
        title.textContent = t.title;

        const cb = document.createElement('input');
        cb.className = 'checkBox';
        cb.type = 'checkBox';
        cb.checked = !!t.completed;

        cb.addEventListener('change', async () => {
            await fetch(`/tasks/${t.id}`, {
                method: 'PUT',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({ completed: cb.checked })
            });
            await fetchTasks();
        });

        const del = document.createElement('button');
        del.textContent = 'Excluir';
        del.style.width = 'auto';
        del.style.marginTop = '0';
        del.style.padding = '8px 10px';

        del.addEventListener('click', async () => {
            await fetch(`/tasks/${t.id}`,
                { method: 'DELETE' });

            //Confirmação antes de excluir
            const del = confirm("Você deseja excluir a tarefa?");

            if (del) {
                alert("Ação confirmada!");

            } else {
                alert("Ação cancelada.");
                //retorna o default e cancela tudo
                return preventDefault();
            }

            await fetchTasks();
        });

        const edit = document.createElement('button');
        edit.textContent = 'Editar';
        edit.style.width = 'auto';
        edit.style.marginTop = '0';
        edit.style.padding = '8px 10px';

        edit.addEventListener('click', async () => {
            const editar = prompt('Editar', t.title);

            await fetch(`/tasks/${t.id}`,
                {
                    method: 'PUT',
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify({ title: editar })

                });

            await fetchTasks();
        });

        const actions = document.createElement('span');
        actions.className = 'task-cta';
        actions.appendChild(cb);
        actions.appendChild(del);
        actions.appendChild(edit);
        li.appendChild(title);
        li.appendChild(actions);
        ul.appendChild(li);
    });
}

async function fetchTasks() {
    const res = await fetch('/tasks');

    if (res.status === 401) {
        show('login');
        return;
    }

    const data = await res.json();
    tasksCache = data; // salva todas as tarefas
    renderTasks(tasksCache);
}

document.addEventListener('DOMContentLoaded', async () => {
    const btntodas = document.getElementById('btntodas');
    
    btntodas.addEventListener('click', () => {
        renderTasks(tasksCache);
    });

});

document.addEventListener('DOMContentLoaded', async () => {
    const btnconcluidas = document.getElementById('btnconcluidas');

    btnconcluidas.addEventListener('click', () => {
        // filtra tarefas concluídas
        const btnconcluidas = tasksCache.filter(t => t.completed);
        renderTasks(btnconcluidas);
    });

});

document.addEventListener('DOMContentLoaded', async () => {
    const btnpendentes = document.getElementById('btnpendentes');

    btnpendentes.addEventListener('click', () => {
        // filtra tarefas concluídas
        const btnpendentes = tasksCache.filter(t => !t.completed);
        renderTasks(btnpendentes);
    });

});
async function checkAuthAndInit() {
    const me = await fetch('/me');

    if (me.ok) {
        show('app');
        await fetchTasks();
    } else {
        show('login');
    }
}

//listener para quando
//carregar o html
document.addEventListener('DOMContentLoaded', async () => {

    const btnLogin = document.getElementById('btnLogin');
    const btnAdd = document.getElementById('btnAdd');
    const btnLogout = document.getElementById('btnLogout');

    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const loginMsg = document.getElementById('loginMsg');
    const newTask = document.getElementById('newTask');

    btnLogin.addEventListener('click', async () => {
        loginMsg.style.display = 'none';
        loginMsg.textContent = '';

        const res = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify({
                username: (username.value || '').trim(),
                password: (password.value || '').trim()
            })
        });

        if (!res.ok) {
            loginMsg.textContent = 'Credenciais Inválidas';
            loginMsg.style.display = 'block';
            return;
        }

        show('app');
        await fetchTasks();
    });

    btnLogout.addEventListener('click', async () => {
        await fetch('/logout', { method: 'POST' });
        show('login');
    });

    btnAdd.addEventListener('click', async () => {
        const title = (newTask.value || '').trim();

        if (!title) return;

        const res = await fetch('/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, completed: false })
        });

        if (res.status === 401) {
            show('login');
            return;
        }

        newTask.value = '';
        await fetchTasks();
    });


    await checkAuthAndInit();
});

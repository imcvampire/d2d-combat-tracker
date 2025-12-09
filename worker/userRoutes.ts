import { Hono } from "hono";
import { Env } from './core-utils';
import type { DemoItem, ApiResponse, CombatState, AddEntityRequest, UpdateEntityRequest, CreateCombatRequest } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // --- COMBAT TRACKER ROUTES ---
    const handleDO = async (c: any, operation: (stub: any) => Promise<any>) => {
        try {
            const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
            const data = await operation(stub);
            if (!data) {
                return c.json({ success: false, error: 'Not Found' } satisfies ApiResponse, 404);
            }
            return c.json({ success: true, data } satisfies ApiResponse<CombatState>);
        } catch (e: any) {
            return c.json({ success: false, error: e.message } satisfies ApiResponse, 500);
        }
    };
    app.post('/api/combat', async (c) => {
        const { name } = await c.req.json<CreateCombatRequest>();
        return handleDO(c, (stub) => stub.createCombat(name));
    });
    app.get('/api/combat/:id', async (c) => {
        const id = c.req.param('id');
        return handleDO(c, (stub) => stub.getCombat(id));
    });
    app.post('/api/combat/:id/entity', async (c) => {
        const id = c.req.param('id');
        const entity = await c.req.json<AddEntityRequest>();
        return handleDO(c, (stub) => stub.addEntity(id, entity));
    });
    app.put('/api/combat/:id/entity/:eid', async (c) => {
        const { id, eid } = c.req.param();
        const updates = await c.req.json<UpdateEntityRequest>();
        return handleDO(c, (stub) => stub.updateEntity(id, eid, updates));
    });
    app.delete('/api/combat/:id/entity/:eid', async (c) => {
        const { id, eid } = c.req.param();
        return handleDO(c, (stub) => stub.deleteEntity(id, eid));
    });
    app.post('/api/combat/:id/next-turn', async (c) => {
        const id = c.req.param('id');
        return handleDO(c, (stub) => stub.nextTurn(id));
    });
    app.post('/api/combat/:id/reset', async (c) => {
        const id = c.req.param('id');
        return handleDO(c, (stub) => stub.resetCombat(id));
    });
    // --- PRE-EXISTING DEMO ROUTES ---
    app.get('/api/test', (c) => c.json({ success: true, data: { name: 'CF Workers Demo' }}));
    app.get('/api/demo', async (c) => {
        const durableObjectStub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await durableObjectStub.getDemoItems();
        return c.json({ success: true, data } satisfies ApiResponse<DemoItem[]>);
    });
    app.get('/api/counter', async (c) => {
        const durableObjectStub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await durableObjectStub.getCounterValue();
        return c.json({ success: true, data } satisfies ApiResponse<number>);
    });
    app.post('/api/counter/increment', async (c) => {
        const durableObjectStub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await durableObjectStub.increment();
        return c.json({ success: true, data } satisfies ApiResponse<number>);
    });
    app.post('/api/demo', async (c) => {
        const body = await c.req.json() as DemoItem;
        const durableObjectStub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await durableObjectStub.addDemoItem(body);
        return c.json({ success: true, data } satisfies ApiResponse<DemoItem[]>);
    });
    app.put('/api/demo/:id', async (c) => {
        const id = c.req.param('id');
        const body = await c.req.json() as Partial<Omit<DemoItem, 'id'>>;
        const durableObjectStub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await durableObjectStub.updateDemoItem(id, body);
        return c.json({ success: true, data } satisfies ApiResponse<DemoItem[]>);
    });
    app.delete('/api/demo/:id', async (c) => {
        const id = c.req.param('id');
        const durableObjectStub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await durableObjectStub.deleteDemoItem(id);
        return c.json({ success: true, data } satisfies ApiResponse<DemoItem[]>);
    });
}
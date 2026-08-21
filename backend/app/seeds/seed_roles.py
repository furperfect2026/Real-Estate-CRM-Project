import asyncio
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.role import Role, Permission, RolePermission

permissions_list = [
    ('users', 'view'), ('users', 'create'), ('users', 'update'), ('users', 'delete'),
    ('roles', 'view'), ('roles', 'create'), ('roles', 'update'), ('roles', 'delete'),
    ('teams', 'view'), ('teams', 'create'), ('teams', 'update'), ('teams', 'delete'),
    ('tasks', 'view'), ('tasks', 'create'), ('tasks', 'update'), ('tasks', 'delete'), ('tasks', 'view_team'), ('tasks', 'assign'),
    ('leads', 'view'), ('leads', 'create'), ('leads', 'update'), ('leads', 'delete'), ('leads', 'assign'), ('leads', 'import'), ('leads', 'export'),
    ('inventory', 'view'), ('inventory', 'create'), ('inventory', 'update'), ('inventory', 'delete'),
    ('projects', 'view'), ('projects', 'create'), ('projects', 'update'), ('projects', 'delete'),
    ('bookings', 'view'), ('bookings', 'create'), ('bookings', 'update'), ('bookings', 'approve'),
    ('payments', 'view'), ('payments', 'create'), ('payments', 'update'),
    ('reports', 'view'), ('reports', 'export'),
    ('settings', 'view'), ('settings', 'update'),
    ('audit', 'view'),
    ('dashboard', 'view')
]

roles_setup = {
    'SUPER_ADMIN': [p for p in permissions_list],
    'COMPANY_ADMIN': [p for p in permissions_list if p[0] != 'settings'],
    'CEO': [p for p in permissions_list if p[0] in ['users', 'roles', 'teams', 'tasks', 'leads', 'inventory', 'projects', 'bookings', 'payments', 'reports', 'dashboard'] and p[1] in ['view', 'export']],
}

async def seed():
    async with AsyncSessionLocal() as db:
        # Create permissions
        perm_objs = {}
        for res, act in permissions_list:
            result = await db.execute(select(Permission).filter(Permission.resource == res, Permission.action == act))
            perm = result.scalars().first()
            if not perm:
                perm = Permission(resource=res, action=act)
                db.add(perm)
            perm_objs[(res, act)] = perm
        
        await db.commit()
        
        # Reload to get IDs
        for res, act in permissions_list:
            result = await db.execute(select(Permission).filter(Permission.resource == res, Permission.action == act))
            perm_objs[(res, act)] = result.scalars().first()

        # Create Roles
        for role_name, perms in roles_setup.items():
            result = await db.execute(select(Role).filter(Role.name == role_name, Role.organization_id.is_(None)))
            role = result.scalars().first()
            
            if not role:
                role = Role(name=role_name, slug=role_name.lower(), is_system=True)
                db.add(role)
                await db.commit()
                await db.refresh(role)
                
            # Assign permissions
            for res, act in perms:
                perm = perm_objs[(res, act)]
                # Check if assigned
                rp_res = await db.execute(select(RolePermission).filter(RolePermission.role_id == role.id, RolePermission.permission_id == perm.id))
                if not rp_res.scalars().first():
                    db.add(RolePermission(role_id=role.id, permission_id=perm.id))
                    
        await db.commit()
        print("Seeding completed!")

if __name__ == "__main__":
    asyncio.run(seed())

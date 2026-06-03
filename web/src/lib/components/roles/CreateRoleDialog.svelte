<script lang="ts">
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle,
	} from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import type { Capacity, Tier } from '$lib/auth/types';
	import type { RoleCreatePayload } from '$lib/schemas/role';

	interface Props {
		open: boolean;
		busy: boolean;
		maxTier: Tier;
		onOpenChange: (open: boolean) => void;
		onSubmit: (payload: RoleCreatePayload) => void;
	}

	let { open, busy, maxTier, onOpenChange, onSubmit }: Props = $props();

	let name = $state('');
	let label = $state('');
	// svelte-ignore state_referenced_locally
	let tier = $state<number>(Math.max(maxTier, 4));
	let is_manager = $state(false);
	let is_role_admin = $state(false);
	let capacities = $state<Capacity[]>([]);

	const ALL_CAPACITIES: Capacity[] = [
		'create_lockers',
		'configure_system',
		'audit_log_full',
		'purchase_orders',
		'manage_suppliers',
		'cascade_delete_role',
		'validate_catalog',
		'manage_stock_thresholds',
	];

	function toggleCapacity(c: Capacity, on: boolean) {
		capacities = on ? [...capacities, c] : capacities.filter((x) => x !== c);
	}

	let canSubmit = $derived(
		name.length > 0 && label.length > 0 && /^[a-z0-9_-]+$/.test(name) && tier <= maxTier,
	);

	function reset() {
		name = '';
		label = '';
		tier = Math.max(maxTier, 4);
		is_manager = false;
		is_role_admin = false;
		capacities = [];
	}
</script>

<Dialog
	{open}
	onOpenChange={(v) => {
		if (!v) reset();
		onOpenChange(v);
	}}
>
	<DialogContent class="sm:max-w-lg">
		<DialogHeader>
			<DialogTitle>Créer un rôle custom</DialogTitle>
			<DialogDescription>
				Le rôle sera créé côté API et exposé comme groupe Keycloak. Tu ne peux pas créer un rôle
				à un tier supérieur au tien (T{maxTier} max).
			</DialogDescription>
		</DialogHeader>

		<div class="space-y-3 py-2">
			<div class="grid grid-cols-2 gap-3">
				<div class="space-y-1">
					<Label for="role-name">Nom (technique)</Label>
					<Input
						id="role-name"
						bind:value={name}
						placeholder="ex: createch-3d"
						class="font-mono"
						disabled={busy}
					/>
				</div>
				<div class="space-y-1">
					<Label for="role-tier">Tier</Label>
					<Select
						type="single"
						value={String(tier)}
						onValueChange={(v) => v && (tier = Number(v))}
					>
						<SelectTrigger id="role-tier">T{tier}</SelectTrigger>
						<SelectContent>
							{#each [0, 1, 2, 3, 4].filter((t) => t >= maxTier) as t (t)}
								<SelectItem value={String(t)}>T{t}</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</div>
			</div>

			<div class="space-y-1">
				<Label for="role-label">Libellé (affichage)</Label>
				<Input
					id="role-label"
					bind:value={label}
					placeholder="ex: Createch 3D"
					disabled={busy}
				/>
			</div>

			<div class="grid grid-cols-2 gap-3 pt-1">
				<label class="flex items-center gap-2 text-sm">
					<Switch bind:checked={is_manager} disabled={busy} />
					<span>manager</span>
				</label>
				<label class="flex items-center gap-2 text-sm">
					<Switch bind:checked={is_role_admin} disabled={busy} />
					<span>role_admin</span>
				</label>
			</div>

			<div class="space-y-2 pt-1">
				<Label>Capacités</Label>
				<div class="grid grid-cols-2 gap-1.5">
					{#each ALL_CAPACITIES as c (c)}
						<label class="flex items-center gap-2 text-xs">
							<Checkbox
								checked={capacities.includes(c)}
								onCheckedChange={(v) => toggleCapacity(c, v === true)}
								disabled={busy}
							/>
							<span class="font-mono">{c}</span>
						</label>
					{/each}
				</div>
			</div>
		</div>

		<DialogFooter>
			<Button variant="outline" onclick={() => onOpenChange(false)} disabled={busy}>Annuler</Button>
			<Button
				onclick={() =>
					onSubmit({
						name,
						label,
						tier,
						is_manager,
						is_role_admin,
						capacities,
					})}
				disabled={!canSubmit || busy}
			>
				{busy ? 'Création…' : 'Créer'}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>

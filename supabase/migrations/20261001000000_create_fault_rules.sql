-- Create fault_rules table for 5R Circular Repair Rule Engine
CREATE TABLE IF NOT EXISTS public.fault_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device text NOT NULL,
  component text NOT NULL,
  condition text NOT NULL,
  fault text NOT NULL,
  severity text NOT NULL,
  five_r text NOT NULL,
  recommendation text NOT NULL,
  safety_warning text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Grant access to anon and authenticated
GRANT SELECT ON public.fault_rules TO anon, authenticated;
GRANT ALL ON public.fault_rules TO service_role;

-- Enable RLS
ALTER TABLE public.fault_rules ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read fault rules
CREATE POLICY "Anyone can view fault rules"
  ON public.fault_rules FOR SELECT TO anon, authenticated USING (true);

-- Insert initial 5R knowledge base rules
INSERT INTO public.fault_rules (device, component, condition, fault, severity, five_r, recommendation, safety_warning) VALUES
('Laptop', 'Battery', 'Swollen', 'Lithium Battery Degradation & Swelling', 'High', 'Recycle', 'Stop using the device immediately. Replace battery before powering on.', '⚠️ Do not puncture, crush, or heat the swollen battery. Dispose via certified e-waste recycling.'),
('Laptop', 'Screen', 'Cracked', 'Display Panel Physical Fracture', 'Medium', 'Reuse', 'Replace the LCD/OLED panel at a Skill Center to restore laptop to full service life.', 'Be careful of sharp glass fragments on the cracked screen surface.'),
('Laptop', 'Fan', 'Dusty', 'Thermal Airflow Obstruction', 'Low', 'Reduce', 'Clean fan assembly with compressed air and re-apply thermal paste.', 'Unplug power and disconnect battery before opening thermal assembly.'),
('Laptop', 'Hinge', 'Broken', 'Chassis Mechanical Strain', 'Medium', 'Retrieve', 'Harvest working motherboard & display. Replace broken hinge housing.', 'Avoid forceful opening to prevent tearing internal ribbon cables.'),
('Smartphone', 'Screen', 'Cracked', 'Front Glass & Digitizer Damage', 'Medium', 'Reuse', 'Replace glass digitizer assembly to extend smartphone lifespan.', 'Apply tape over cracked glass to prevent finger injury during backup.'),
('Smartphone', 'Battery', 'Swollen', 'Cell Gas Buildup', 'High', 'Recycle', 'Safely remove battery and send for hazardous battery recycling.', '⚠️ Fire hazard: Do not charge or press on the swollen area.'),
('Smartphone', 'Charging Port', 'Corroded', 'Moisture Oxidation in Type-C/Lightning Port', 'Low', 'Retrieve', 'Clean port pins with isopropyl alcohol or replace port flex module.', 'Ensure port is completely dry before connecting power.'),
('Smartphone', 'Camera', 'Cracked', 'Lens Glass Fracture', 'Low', 'Reuse', 'Replace external camera glass element or camera module.', 'Avoid touching optical sensor directly.'),
('Charger', 'Cable', 'Frayed', 'Insulation Wear & Exposed Conductor', 'High', 'Recycle', 'Discontinue use immediately. Frayed cables cause short circuits and shock.', '⚠️ Shock Hazard: Do not plug in frayed high-voltage cables.'),
('Charger', 'Plug', 'Bent', 'Terminal Deformity', 'Medium', 'Redesign', 'Replace power adapter or recycle if molded unit.', 'Do not force bent pins into wall sockets.'),
('Charger', 'Body', 'Burned', 'Overheating / Electrical Arcing', 'High', 'Recycle', 'Dispose of charger at e-waste collection point. Do not attempt repair.', '⚠️ Severe Fire Risk: Internal transformer breakdown.'),
('Desktop', 'Power Supply', 'Burned', 'PSU Capacitor Failure', 'High', 'Recycle', 'Replace SMPS power supply unit.', '⚠️ High Voltage Risk: PSU capacitors store dangerous charge even when unplugged.'),
('Television', 'Screen', 'Cracked', 'Matrix Panel Rupture', 'High', 'Recycle', 'Recycle TV panel for raw glass/plastics. Component cost exceeds unit value.', 'Handle large glass panels with protective gloves.'),
('Earphones', 'Cable', 'Frayed', 'Wire Strain Breakage', 'Low', 'Retrieve', 'Harvest drivers or recycle wire copper.', 'Small copper wires can be retrieved for scrap.'),
('Keyboard', 'Key', 'Missing', 'Mechanical Switch Top Cap Missing', 'Low', 'Reduce', 'Replace missing keycap with compatible 3D-printed or harvested keycap.', 'Ensure switch stem is intact before snapping on new keycap');

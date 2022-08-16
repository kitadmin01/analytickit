DROP FUNCTION update_partitions;
DROP FUNCTION create_partitions;

ALTER TABLE analytickit_event rename to old_analytickit_event;
CREATE TABLE analytickit_event (like old_analytickit_event including defaults);

ALTER SEQUENCE analytickit_event_id_seq OWNED BY analytickit_event."id";

INSERT INTO public.analytickit_event (id, event, properties, elements, timestamp, team_id, distinct_id, elements_hash)
SELECT id, event, properties, elements, timestamp, team_id, distinct_id, elements_hash
FROM public.old_analytickit_event;

DROP TABLE old_analytickit_event CASCADE;
DROP TABLE analytickit_event_partitions_manifest CASCADE;

ALTER TABLE analytickit_action_events DROP COLUMN timestamp, DROP COLUMN event;
ALTER TABLE analytickit_element DROP COLUMN timestamp, DROP COLUMN event;

CREATE UNIQUE INDEX analytickit_event_pkey ON public.analytickit_event USING btree (id);
CREATE INDEX analytickit_event_team_id_a8b4c6dc ON public.analytickit_event USING btree (team_id);
CREATE INDEX analytickit_event_idx_distinct_id ON public.analytickit_event USING btree (distinct_id);
CREATE INDEX analytickit_eve_element_48becd_idx ON public.analytickit_event USING btree (elements_hash);
CREATE INDEX analytickit_eve_timesta_1f6a8c_idx ON public.analytickit_event USING btree ("timestamp", team_id, event);
ALTER TABLE analytickit_event ADD CONSTRAINT analytickit_event_team_id_a8b4c6dc_fk_analytickit_team_id FOREIGN KEY (team_id) REFERENCES analytickit_team(id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE analytickit_action_events ADD CONSTRAINT analytickit_action_events_event_id_7077ea70_fk_analytickit_event_id FOREIGN KEY (event_id) REFERENCES analytickit_event(id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE analytickit_element ADD CONSTRAINT analytickit_element_event_id_bb6549a0_fk_analytickit_event_id FOREIGN KEY (event_id) REFERENCES analytickit_event(id) DEFERRABLE INITIALLY DEFERRED;
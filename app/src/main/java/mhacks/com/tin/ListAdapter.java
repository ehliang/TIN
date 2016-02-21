package mhacks.com.tin;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.HashMap;

/**
 * Created by xe on 2016-02-20.
 */
public class ListAdapter extends ArrayAdapter<String>{

    public ListAdapter(Context context, ArrayList<String> strings)
    {
        super(context,0, strings);
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent)
    {
        String command = getItem(position);
        if (convertView == null) {
            convertView = LayoutInflater.from(getContext()).inflate(R.layout.direction_item, parent, false);
        }

        TextView directionsText = (TextView) convertView.findViewById(R.id.direction_text);
        TextView directionsNumber = (TextView) convertView.findViewById(R.id.direction_number);
        directionsText.setText(command);
        directionsNumber.setText(""+ position);
        return convertView;
    }

}
